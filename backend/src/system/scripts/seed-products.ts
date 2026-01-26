// @ts-nocheck
import { productsDataUk, productSubcategoryMappingUk } from "./data/products.data.uk";
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
    const categoryMap = {};        // slug -> id (parent categories only)
    const subcategoryMap = {};     // parentSlug -> array of subcategories
    const allCategoryMap = {};     // slug -> {id, parentId}

    for (const cat of categories) {
      allCategoryMap[cat.slug] = {
        id: cat.id,
        parentId: cat.parentId
      };

      if (!cat.parentId) {
        // Parent category
        categoryMap[cat.slug] = cat.id;
      } else {
        // Subcategory - find parent
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
          // Take 11 products from each category
          const categoryProducts = productsDataUk[categorySlug];

          // If category has less than 11 products, take all
          const productsToTake = Math.min(11, categoryProducts.length);
          const products = categoryProducts.slice(0, productsToTake);

          productsForSupplier.push(...products.map(p => ({
            ...p,
            categorySlug
          })));
        } else {
          console.log(`   ⚠️  No products found for category: ${categorySlug}`);
        }
      }

      // If we collected less than 22 products, add from other categories
      if (productsForSupplier.length < 22) {
        const needed = 22 - productsForSupplier.length;
        console.log(`   ℹ️  Need ${needed} more products`);

        // Add products from other categories
        for (const categorySlug in productsDataUk) {
          if (productsForSupplier.length >= 22) break;
          if (!supplier.categories.includes(categorySlug)) {
            const additionalProducts = productsDataUk[categorySlug].slice(0, 5);
            productsForSupplier.push(...additionalProducts.map(p => ({
              ...p,
              categorySlug
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

        try {
          const categoryId = categoryMap[product.categorySlug];

          if (!categoryId) {
            console.log(`   ⚠️  Skipping ${product.name} - category ${product.categorySlug} not found`);
            continue;
          }

          // Determine subcategory for product
          let subcategoryId = null;

          // Don't assign subcategories for 'other' category
          if (product.categorySlug !== 'other') {
            // First check product mapping
            let subcategorySlug = null;
            if (productSubcategoryMappingUk[product.categorySlug]) {
              const mapping = productSubcategoryMappingUk[product.categorySlug];
              subcategorySlug = mapping[product.name] || mapping['default'];
            }

            // If we found subcategory slug, find its ID
            if (subcategorySlug) {
              const subcategory = categories.find(c => c.slug === subcategorySlug);
              subcategoryId = subcategory ? subcategory.id : null;
            }

            // If not found through mapping, take random subcategory
            if (!subcategoryId) {
              const availableSubcategories = subcategoryMap[product.categorySlug];
              if (availableSubcategories && availableSubcategories.length > 0) {
                // Select random subcategory
                const randomIndex = Math.floor(Math.random() * availableSubcategories.length);
                subcategoryId = availableSubcategories[randomIndex].id;
              }
            }
          }

          await dataSource.query(`
            INSERT INTO products (
              "id", "name", "description", "price", 
              "supplierId", "categoryId", "subcategoryId",
              "images", "stock", "status", "tags", 
              "createdAt", "updatedAt"
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6,
              $7, $8, $9, $10, $11, $12
            )
          `, [
            `${product.name}`,
            `${product.description}. Supplier: ${supplier.companyName}.`,
            product.price,
            supplier.id,
            categoryId,
            subcategoryId, // Add subcategoryId
            '[]', // Empty array for images
            Math.floor(Math.random() * 50) + 20, // 20-70 pieces
            'active',
            JSON.stringify([
              product.categorySlug,
              supplier.theme.name,
              'фермерський',
              // Add subcategory tag if exists
              ...(subcategoryId ? [`підкатегорія`] : [])
            ]),
            new Date(),
            new Date()
          ]);

          createdCount++;

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

      // Statistics for subcategories for this supplier
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
    console.log(`📈 Average per supplier: ${(parseInt(productsCount[0].count) / suppliersWithIds.length).toFixed(1)}`);

    // Detailed statistics by category
    console.log('\n📊 Products by category:');
    for (const categorySlug in productsDataUk) {
      const categoryInfo = allCategoryMap[categorySlug];
      if (categoryInfo) {
        const countResult = await dataSource.query(
          'SELECT COUNT(*) FROM products WHERE "categoryId" = $1',
          [categoryInfo.id]
        );
        const count = parseInt(countResult[0].count);
        if (count > 0) {
          console.log(`   📁 ${categorySlug}: ${count} products`);

          // Show subcategories for this category
          const subcategories = subcategoryMap[categorySlug];
          if (subcategories && subcategories.length > 0) {
            for (const subcat of subcategories) {
              const subcatCount = await dataSource.query(
                'SELECT COUNT(*) FROM products WHERE "subcategoryId" = $1',
                [subcat.id]
              );
              const subCount = parseInt(subcatCount[0].count);
              if (subCount > 0) {
                console.log(`      ├── ${subcat.name}: ${subCount} products`);
              }
            }
          }
        }
      }
    }

    // Overall subcategory statistics
    console.log('\n📊 Subcategory statistics:');
    const totalWithSubcategory = await dataSource.query(
      'SELECT COUNT(*) FROM products WHERE "subcategoryId" IS NOT NULL'
    );
    const totalProductsCount = await dataSource.query('SELECT COUNT(*) FROM products');

    const totalProductsNum = parseInt(totalProductsCount[0].count);
    const withSubcategoryNum = parseInt(totalWithSubcategory[0].count);
    const percentage = totalProductsNum > 0 ? Math.round((withSubcategoryNum / totalProductsNum) * 100) : 0;

    console.log(`   ✅ Products with subcategory: ${withSubcategoryNum}/${totalProductsNum} (${percentage}%)`);
    console.log(`   📝 Products without subcategory: ${totalProductsNum - withSubcategoryNum}`);

    // 'other' category - special statistics
    const otherCategoryId = categoryMap['other'];
    if (otherCategoryId) {
      const otherProducts = await dataSource.query(
        'SELECT COUNT(*) FROM products WHERE "categoryId" = $1',
        [otherCategoryId]
      );
      const otherCount = parseInt(otherProducts[0].count);
      if (otherCount > 0) {
        console.log(`   🎁 'other' category: ${otherCount} products (without subcategories)`);
      }
    }

    return {
      totalProducts: totalProductsNum,
      withSubcategory: withSubcategoryNum,
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