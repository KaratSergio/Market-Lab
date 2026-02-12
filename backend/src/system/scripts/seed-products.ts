// @ts-nocheck
import { productsDataUk, productSubcategoryMappingUk } from "./data/products.data.uk";
import { productsDataEn, productSubcategoryMappingEn } from "./data/products.data.en";
import { suppliersDataUk } from './data/suppliers.data.uk';

export async function seedProducts(dataSource: any) {
  console.log('🛒 Starting products seeding...');

  try {
    console.log('📋 Loading suppliers data...');

    // Get suppliers IDs from database to match with static data
    const dbSuppliers = await dataSource.query(`
      SELECT 
        s.id,
        s."companyName",
        s."user_id" as "userId",
        u.email
      FROM suppliers s
      JOIN users u ON s.user_id = u.id
      WHERE u.roles = 'supplier'
      AND s.status = 'approved'
      ORDER BY s."companyName"
    `);

    if (dbSuppliers.length === 0) {
      throw new Error('No suppliers found in database. Run suppliers seed first!');
    }

    // Match static supplier data with database IDs
    const suppliersWithIds = suppliersDataUk.map(supplierData => {
      const dbSupplier = dbSuppliers.find(db => db.email === supplierData.email);
      if (!dbSupplier) {
        throw new Error(`Supplier ${supplierData.companyName} (${supplierData.email}) not found in database`);
      }

      return {
        id: dbSupplier.id,
        userId: dbSupplier.userId,
        companyName: dbSupplier.companyName,
        email: dbSupplier.email,
        theme: supplierData.theme,
        categories: supplierData.theme.categories
      };
    });

    console.log(`✅ Loaded ${suppliersWithIds.length} suppliers`);

    // Get ALL categories (both parent and child)
    const categories = await dataSource.query(
      `SELECT id, slug, "parentId", name FROM categories ORDER BY "parentId" NULLS FIRST, "order"`
    );

    // Create maps for quick access
    const categoryMap = {};
    const subcategoryMap = {};
    const allCategoryMap = {};

    for (const cat of categories) {
      allCategoryMap[cat.slug] = {
        id: cat.id,
        parentId: cat.parentId,
        name: cat.name
      };

      if (!cat.parentId) {
        categoryMap[cat.slug] = cat.id;
      } else {
        const parentCategory = categories.find(c => c.id === cat.parentId);
        if (parentCategory) {
          if (!subcategoryMap[parentCategory.slug]) {
            subcategoryMap[parentCategory.slug] = [];
          }
          subcategoryMap[parentCategory.slug].push({
            id: cat.id,
            slug: cat.slug,
            name: cat.name
          });
        }
      }
    }

    console.log('\n🛒 Creating 22 products per supplier...');
    let totalProducts = 0;

    for (const supplier of suppliersWithIds) {
      console.log(`\n🏭 Supplier: ${supplier.companyName}`);
      console.log(`   Theme: ${supplier.theme.name}`);
      console.log(`   Categories: ${supplier.categories.join(', ')}`);

      let productsForSupplier = [];

      // Collect products from all supplier categories
      for (const categorySlug of supplier.categories) {
        if (productsDataUk[categorySlug]) {
          const categoryProducts = productsDataUk[categorySlug];
          const categoryProductsEn = productsDataEn[categorySlug] || [];

          const productsToTake = Math.min(11, categoryProducts.length);
          const products = categoryProducts.slice(0, productsToTake);
          const productsEn = categoryProductsEn.slice(0, productsToTake);

          productsForSupplier.push(...products.map((p, index) => ({
            ...p,
            categorySlug,
            englishData: productsEn[index] || {}
          })));
        } else {
          console.log(`   ⚠️  No products found for category: ${categorySlug}`);
        }
      }

      // If we collected less than 22 products, add from other categories
      if (productsForSupplier.length < 22) {
        const needed = 22 - productsForSupplier.length;
        console.log(`   ℹ️  Need ${needed} more products`);

        for (const categorySlug in productsDataUk) {
          if (productsForSupplier.length >= 22) break;
          if (!supplier.categories.includes(categorySlug)) {
            const additionalProducts = productsDataUk[categorySlug].slice(0, 5);
            const additionalProductsEn = (productsDataEn[categorySlug] || []).slice(0, 5);

            productsForSupplier.push(...additionalProducts.map((p, index) => ({
              ...p,
              categorySlug,
              englishData: additionalProductsEn[index] || {}
            })));
          }
        }
      }

      // Limit to 22 products
      productsForSupplier = productsForSupplier.slice(0, 22);

      // Create products in DB
      let createdCount = 0;

      for (let i = 0; i < productsForSupplier.length; i++) {
        const product = productsForSupplier[i];
        const productEn = product.englishData || {};

        try {
          const categoryId = categoryMap[product.categorySlug];

          if (!categoryId) {
            console.log(`   ⚠️  Skipping ${product.name} - category ${product.categorySlug} not found`);
            continue;
          }

          // Determine subcategory for product
          let subcategoryId = null;
          let subcategoryName = '';

          if (product.categorySlug !== 'other') {
            let subcategorySlug = null;
            if (productSubcategoryMappingUk[product.categorySlug]) {
              const mapping = productSubcategoryMappingUk[product.categorySlug];
              subcategorySlug = mapping[product.name] || mapping['default'];
            }

            if (subcategorySlug) {
              const subcategory = categories.find(c => c.slug === subcategorySlug);
              subcategoryId = subcategory ? subcategory.id : null;
              subcategoryName = subcategory ? subcategory.name : '';
            }

            if (!subcategoryId) {
              const availableSubcategories = subcategoryMap[product.categorySlug];
              if (availableSubcategories && availableSubcategories.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableSubcategories.length);
                subcategoryId = availableSubcategories[randomIndex].id;
                subcategoryName = availableSubcategories[randomIndex].name;
              }
            }
          }

          const descriptionUk = product.description; // full description from seed
          const shortDescriptionUk = product.shortDescription; // short description from seed

          const descriptionEn = productEn.description; // English full description
          const shortDescriptionEn = productEn.shortDescription; // English short description

          // Generate smart tags for better search and filtering
          const tags = generateProductTags({
            productName: product.name,
            categorySlug: product.categorySlug,
            subcategoryName: subcategoryName,
            supplierTheme: supplier.theme.name,
            price: product.price
          });

          const productResult = await dataSource.query(`
            INSERT INTO products (
              "id", "name", "description", "shortDescription", "price", 
              "supplierId", "categoryId", "subcategoryId",
              "images", "stock", "status", "tags", 
              "createdAt", "updatedAt"
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7,
              $8, $9, $10, $11, $12, $13
            ) RETURNING id
          `, [
            product.name,
            descriptionUk,
            shortDescriptionUk,
            product.price,
            supplier.id,
            categoryId,
            subcategoryId,
            JSON.stringify([]),      // empty images array
            Math.floor(Math.random() * 50) + 20,
            'active',
            JSON.stringify(tags),
            new Date(),
            new Date()
          ]);

          const productId = productResult[0].id;
          createdCount++;

          // Add English translations for all fields
          if (productEn.name || productEn.description || productEn.shortDescription) {
            console.log(`   🌐 Adding English translations for product ${product.name}...`);

            const translationsData = [
              {
                entityId: productId,
                entityType: 'product',
                languageCode: 'en',
                fieldName: 'name',
                translationText: productEn.name || product.name
              },
              {
                entityId: productId,
                entityType: 'product',
                languageCode: 'en',
                fieldName: 'description',
                translationText: descriptionEn
              },
              {
                entityId: productId,
                entityType: 'product',
                languageCode: 'en',
                fieldName: 'shortDescription',
                translationText: shortDescriptionEn
              }
            ];

            for (const translation of translationsData) {
              try {
                await dataSource.query(`
                  INSERT INTO translations (
                    "id", "entityId", "entityType", "languageCode", 
                    "fieldName", "translationText", "createdAt", "updatedAt"
                  ) VALUES (
                    gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7
                  )
                `, [
                  translation.entityId,
                  translation.entityType,
                  translation.languageCode,
                  translation.fieldName,
                  translation.translationText,
                  new Date(),
                  new Date()
                ]);

                console.log(`     ✅ Translation added: ${translation.fieldName}`);
              } catch (error) {
                console.error(`     ❌ Failed to add translation: ${error.message}`);
              }
            }
          }

          // Log with subcategory information
          let logMessage = `   [${i + 1}/22] ✅ ${product.name} - ${product.price} грн`;
          if (subcategoryId && product.categorySlug !== 'other') {
            if (subcategoryName) {
              logMessage += ` (${subcategoryName})`;
            }
          }

          // Log if descriptions exist
          if (descriptionUk) logMessage += ` 📝`;
          if (shortDescriptionUk) logMessage += ` 📋`;
          console.log(logMessage);

        } catch (error) {
          console.error(`   ❌ Failed to create ${product.name}:`, error.message);
        }
      }

      totalProducts += createdCount;
      console.log(`   📊 Created ${createdCount} products for ${supplier.companyName}`);

      const supplierProducts = await dataSource.query(
        `SELECT COUNT(*) as total, COUNT("subcategoryId") as with_subcategory 
         FROM products WHERE "supplierId" = $1`,
        [supplier.id]
      );

      const withSubcategory = parseInt(supplierProducts[0].with_subcategory);
      const total = parseInt(supplierProducts[0].total);
      if (total > 0) {
        const percentage = Math.round((withSubcategory / total) * 100);
        console.log(`   🏷️  Products with subcategory: ${withSubcategory}/${total} (${percentage}%)`);
      }
    }

    // Statistics
    const productsCount = await dataSource.query('SELECT COUNT(*) FROM products');
    console.log(`\n🎉 Total products created: ${parseInt(productsCount[0].count)}`);

    const translationsCount = await dataSource.query(
      `SELECT COUNT(*) FROM translations WHERE "entityType" = 'product'`
    );
    console.log(`🌐 English translations added: ${parseInt(translationsCount[0].count)}`);

    console.log(`📈 Average per supplier: ${(parseInt(productsCount[0].count) / suppliersWithIds.length).toFixed(1)}`);

    // Detailed statistics
    const descriptionStats = await dataSource.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN "description" IS NOT NULL AND "description" != '' THEN 1 END) as with_description,
        COUNT(CASE WHEN "shortDescription" IS NOT NULL AND "shortDescription" != '' THEN 1 END) as with_short_description
      FROM products
    `);

    console.log('\n📊 Product descriptions:');
    console.log(`   📝 Products with full description: ${parseInt(descriptionStats[0].with_description)}/${parseInt(descriptionStats[0].total)}`);
    console.log(`   📋 Products with short description: ${parseInt(descriptionStats[0].with_short_description)}/${parseInt(descriptionStats[0].total)}`);

    return {
      totalProducts: parseInt(productsCount[0].count),
      withDescription: parseInt(descriptionStats[0].with_description),
      withShortDescription: parseInt(descriptionStats[0].with_short_description),
      translationsCount: parseInt(translationsCount[0].count),
      suppliersCount: suppliersWithIds.length,
      success: true
    };

  } catch (error) {
    console.error('\n❌ Products seeding failed:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}

/**
 * Generate smart product tags for better search and filtering
 */
function generateProductTags({
  productName,
  categorySlug,
  subcategoryName,
  supplierTheme,
  price
}) {
  const tags = [];

  // 1. Keywords from product name (important for search)
  const nameWords = productName
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5);
  tags.push(...nameWords);

  // 2. Category and subcategory
  tags.push(categorySlug);
  if (subcategoryName) {
    tags.push(subcategoryName.toLowerCase());
  }

  // 3. Supplier theme (but not as generic tag)
  // We use theme name without adding extra generic tags

  // 4. Category-specific tags (relevant for search)
  switch (categorySlug) {
    case 'vegetables':
      tags.push('овочі', 'городина');
      break;
    case 'fruits':
      tags.push('фрукти', 'ягоди');
      break;
    case 'dairy-products':
      tags.push('молочні', 'сир', 'молоко', 'сметана');
      break;
    case 'meat-poultry':
      tags.push('м\'ясо', 'птиця', 'ковбаса');
      break;
    case 'eggs':
      tags.push('яйця');
      break;
    case 'honey-bee-products':
      tags.push('мед', 'прополіс', 'бджолиний');
      break;
    case 'bread-bakery':
      tags.push('хліб', 'випічка', 'булочки');
      break;
    case 'grains-cereals':
      tags.push('крупи', 'зерно', 'борошно');
      break;
    case 'preserves':
      tags.push('консервація', 'варення', 'соління');
      break;
    case 'drinks':
      tags.push('напої', 'сік', 'квас', 'чай');
      break;
    case 'nuts-dried-fruits':
      tags.push('горіхи', 'сухофрукти');
      break;
    case 'vegetable-oils':
      tags.push('олія');
      break;
    case 'spices-herbs':
      tags.push('спеції', 'приправи', 'трави');
      break;
    case 'farm-delicacies':
      tags.push('делікатеси', 'домашні');
      break;
    case 'baby-food':
      tags.push('дитяче', 'харчування');
      break;
  }

  // 5. Price category
  if (price < 50) {
    tags.push('недорогі');
  } else if (price >= 50 && price < 150) {
    tags.push('середня-ціна');
  } else {
    tags.push('преміум');
  }

  // 6. Special product attributes (only if present in name)
  if (productName.toLowerCase().includes('органічний') ||
    productName.toLowerCase().includes('біо') ||
    productName.toLowerCase().includes('еко')) {
    tags.push('органічний');
  }

  if (productName.toLowerCase().includes('домашній') ||
    productName.toLowerCase().includes('домашня') ||
    productName.toLowerCase().includes('домашнє')) {
    tags.push('домашній');
  }

  if (productName.toLowerCase().includes('копчений') ||
    productName.toLowerCase().includes('копчена')) {
    tags.push('копчений');
  }

  if (productName.toLowerCase().includes('маринований')) {
    tags.push('маринований');
  }

  if (productName.toLowerCase().includes('сушений') ||
    productName.toLowerCase().includes('сушена')) {
    tags.push('сушений');
  }

  if (productName.toLowerCase().includes('свіжий') ||
    productName.toLowerCase().includes('свіжа')) {
    tags.push('свіжий');
  }

  // 7. Remove duplicates and limit to 15 tags
  const uniqueTags = [...new Set(tags)];
  return uniqueTags.slice(0, 15);
}