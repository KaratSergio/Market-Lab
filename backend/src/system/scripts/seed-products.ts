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
      `SELECT id, slug, "parentId" FROM categories ORDER BY "parentId" NULLS FIRST, "order"`
    );

    // Create maps for quick access
    const categoryMap = {};
    const subcategoryMap = {};
    const allCategoryMap = {};

    for (const cat of categories) {
      allCategoryMap[cat.slug] = {
        id: cat.id,
        parentId: cat.parentId
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
            englishData: productsEn[index]
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
              englishData: additionalProductsEn[index]
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

          if (product.categorySlug !== 'other') {
            let subcategorySlug = null;
            if (productSubcategoryMappingUk[product.categorySlug]) {
              const mapping = productSubcategoryMappingUk[product.categorySlug];
              subcategorySlug = mapping[product.name] || mapping['default'];
            }

            if (subcategorySlug) {
              const subcategory = categories.find(c => c.slug === subcategorySlug);
              subcategoryId = subcategory ? subcategory.id : null;
            }

            if (!subcategoryId) {
              const availableSubcategories = subcategoryMap[product.categorySlug];
              if (availableSubcategories && availableSubcategories.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableSubcategories.length);
                subcategoryId = availableSubcategories[randomIndex].id;
              }
            }
          }

          //  seed data description to shortDescription
          const shortDescriptionUk = product.description || '';
          const shortDescriptionEn = productEn.description || shortDescriptionUk;

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
            '', // description
            shortDescriptionUk, // seed data description to shortDescription
            product.price,
            supplier.id,
            categoryId,
            subcategoryId,
            '[]',
            Math.floor(Math.random() * 50) + 20,
            'active',
            JSON.stringify([
              product.categorySlug,
              supplier.theme.name,
              'фермерський',
              ...(subcategoryId ? ['підкатегорія'] : [])
            ]),
            new Date(),
            new Date()
          ]);

          const productId = productResult[0].id;
          createdCount++;

          // Adding an English translation for the product
          if (productEn.name || productEn.description) {
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
            const availableSubcategories = subcategoryMap[product.categorySlug];
            if (availableSubcategories) {
              const subcat = availableSubcategories.find(sc => sc.id === subcategoryId);
              if (subcat) {
                logMessage += ` (subcat.: ${subcat.name})`;
              }
            }
          }
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

    console.log('\n📊 Products with shortDescription:');
    const shortDescCount = await dataSource.query(
      'SELECT COUNT(*) FROM products WHERE "shortDescription" IS NOT NULL AND "shortDescription" != $1',
      ['']
    );
    console.log(`   ✅ Products with shortDescription: ${parseInt(shortDescCount[0].count)}/${parseInt(productsCount[0].count)}`);

    return {
      totalProducts: parseInt(productsCount[0].count),
      withShortDescription: parseInt(shortDescCount[0].count),
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