import { DataSource } from 'typeorm';


export async function seedCategories(dataSource: DataSource) {
  console.log('🌱 Starting categories seeding...');

  try {
    // 1. Checking the connection
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // 2. Clearing categories
    console.log('🗑️  Clearing all categories...');
    await dataSource.query('DELETE FROM categories');
    console.log('✅ Categories cleared');

    // 3. Create main (parent) categories
    console.log('\n📝 Creating main categories...');

    const mainCategories = [
      {
        name: 'Vegetables',
        slug: 'vegetables',
        description: 'Fresh farm vegetables from natural farming',
        order: 1,
        metaTitle: 'Farm Vegetables',
        metaDescription: 'Natural vegetables without chemical fertilizers and pesticides'
      },
      {
        name: 'Fruits',
        slug: 'fruits',
        description: 'Seasonal fruits from own gardens',
        order: 2,
        metaTitle: 'Seasonal Fruits',
        metaDescription: 'Sun-ripened fruits from ecologically clean regions'
      },
      {
        name: 'Dairy Products',
        slug: 'dairy-products',
        description: 'Natural dairy products without preservatives',
        order: 3,
        metaTitle: 'Homemade Dairy Products',
        metaDescription: 'Milk, cheese, sour cream and other handmade dairy products'
      },
      {
        name: 'Meat and Poultry',
        slug: 'meat-poultry',
        description: 'Fresh farm meat and poultry',
        order: 4,
        metaTitle: 'Farm Meat',
        metaDescription: 'Natural meat fed on natural feed'
      },
      {
        name: 'Eggs',
        slug: 'eggs',
        description: 'Village eggs from free-range chickens',
        order: 5,
        metaTitle: 'Village Eggs',
        metaDescription: 'Eggs from chickens living free-range'
      },
      {
        name: 'Bread and Bakery',
        slug: 'bread-bakery',
        description: 'Homemade bread on natural sourdough',
        order: 6,
        metaTitle: 'Homemade Bakery',
        metaDescription: 'Bread, buns, pies handmade'
      },
      {
        name: 'Honey and Bee Products',
        slug: 'honey-bee-products',
        description: 'Natural honey from own apiaries',
        order: 7,
        metaTitle: 'Natural Honey',
        metaDescription: 'Honey, propolis, pollen from ecologically clean regions'
      },
      {
        name: 'Preserves',
        slug: 'preserves',
        description: 'Homemade preserves from seasonal vegetables and fruits',
        order: 8,
        metaTitle: 'Homemade Preserves',
        metaDescription: 'Jam, pickles, marinades handmade'
      },
      {
        name: 'Drinks',
        slug: 'drinks',
        description: 'Natural drinks without preservatives',
        order: 9,
        metaTitle: 'Homemade Drinks',
        metaDescription: 'Juices, fruit drinks, kvass, herbal teas'
      },
      {
        name: 'Grains and Cereals',
        slug: 'grains-cereals',
        description: 'Natural cereals without artificial processing',
        order: 10,
        metaTitle: 'Natural Cereals',
        metaDescription: 'Buckwheat, rice, oatmeal, millet from own fields'
      },
      {
        name: 'Nuts and Dried Fruits',
        slug: 'nuts-dried-fruits',
        description: 'Natural nuts and dried fruits',
        order: 11,
        metaTitle: 'Nuts and Dried Fruits',
        metaDescription: 'Nut kernels and dried fruits without sugar'
      },
      {
        name: 'Vegetable Oils',
        slug: 'vegetable-oils',
        description: 'Cold-pressed oils',
        order: 12,
        metaTitle: 'Natural Oils',
        metaDescription: 'Sunflower, flax, pumpkin oils cold pressed'
      },
      {
        name: 'Spices and Herbs',
        slug: 'spices-herbs',
        description: 'Natural spices and medicinal herbs',
        order: 13,
        metaTitle: 'Spices and Herbs',
        metaDescription: 'Dried herbs, spices, tea blends'
      },
      {
        name: 'Farm Delicacies',
        slug: 'farm-delicacies',
        description: 'Homemade sausages, cheeses and pates',
        order: 14,
        metaTitle: 'Farm Delicacies',
        metaDescription: 'Sausages, cheeses, pates handmade'
      },
      {
        name: 'Baby Food',
        slug: 'baby-food',
        description: 'Natural food for children',
        order: 15,
        metaTitle: 'Baby Food',
        metaDescription: 'Purees, porridge, snacks for children'
      },
      {
        name: 'Other',
        slug: 'other',
        description: 'Other farm products',
        order: 16,
        metaTitle: 'Other Products',
        metaDescription: 'Various farm products'
      }
    ];

    const savedCategories: Record<string, any> = {};

    for (let i = 0; i < mainCategories.length; i++) {
      const catData = mainCategories[i];
      console.log(`[${i + 1}/${mainCategories.length}] Creating: ${catData.name}`);

      try {
        const result = await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "metaTitle", "metaDescription", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9
          ) RETURNING id, name, slug
        `, [
          catData.name,
          catData.slug,
          catData.description,
          'active',
          catData.order,
          catData.metaTitle,
          catData.metaDescription,
          new Date(),
          new Date()
        ]);

        savedCategories[catData.slug] = result[0];
        console.log(`   ✅ Created: ${catData.name} (ID: ${result[0].id})`);

      } catch (error) {
        console.error(`   ❌ Failed to create category ${catData.name}:`, error.message);
        throw error;
      }
    }

    console.log(`\n✅ Created ${mainCategories.length} main categories`);

    // 4. Creating subcategories
    console.log('\n📝 Creating subcategories...');

    // Subcategories for Vegetables
    if (savedCategories['vegetables']) {
      console.log('\n🥦 Creating subcategories for "Vegetables"...');

      const vegetableSubcategories = [
        { name: 'Root Vegetables', slug: 'root-vegetables', order: 1 },
        { name: 'Leafy Vegetables', slug: 'leafy-vegetables', order: 2 },
        { name: 'Nightshades', slug: 'nightshades', order: 3 },
        { name: 'Cruciferous', slug: 'cruciferous', order: 4 },
        { name: 'Cucurbits', slug: 'cucurbits', order: 5 },
        { name: 'Alliums', slug: 'alliums', order: 6 },
      ];

      for (const subcat of vegetableSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Vegetables subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['vegetables'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Fruits
    if (savedCategories['fruits']) {
      console.log('\n🍎 Creating subcategories for "Fruits"...');

      const fruitSubcategories = [
        { name: 'Berries', slug: 'berries', order: 1 },
        { name: 'Citrus Fruits', slug: 'citrus-fruits', order: 2 },
        { name: 'Stone Fruits', slug: 'stone-fruits', order: 3 },
        { name: 'Tropical Fruits', slug: 'tropical-fruits', order: 4 },
        { name: 'Melons', slug: 'melons', order: 5 },
        { name: 'Pome Fruits', slug: 'pome-fruits', order: 6 },
      ];

      for (const subcat of fruitSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Fruits subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['fruits'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Dairy Products
    if (savedCategories['dairy-products']) {
      console.log('\n🥛 Creating subcategories for "Dairy Products"...');

      const dairySubcategories = [
        { name: 'Milk', slug: 'milk', order: 1 },
        { name: 'Cheese', slug: 'cheese', order: 2 },
        { name: 'Yogurt', slug: 'yogurt', order: 3 },
        { name: 'Butter', slug: 'butter', order: 4 },
        { name: 'Cream', slug: 'cream', order: 5 },
        { name: 'Fermented Dairy', slug: 'fermented-dairy', order: 6 },
      ];

      for (const subcat of dairySubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Dairy products subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['dairy-products'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Meat and Poultry
    if (savedCategories['meat-poultry']) {
      console.log('\n🍗 Creating subcategories for "Meat and Poultry"...');

      const meatSubcategories = [
        { name: 'Pork', slug: 'pork', order: 1 },
        { name: 'Beef', slug: 'beef', order: 2 },
        { name: 'Chicken', slug: 'chicken', order: 3 },
        { name: 'Turkey', slug: 'turkey', order: 4 },
        { name: 'Rabbit', slug: 'rabbit', order: 5 },
        { name: 'Offal', slug: 'offal', order: 6 },
      ];

      for (const subcat of meatSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Meat subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['meat-poultry'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Bread and Bakery
    if (savedCategories['bread-bakery']) {
      console.log('\n🥖 Creating subcategories for "Bread and Bakery"...');

      const breadSubcategories = [
        { name: 'Bread', slug: 'bread', order: 1 },
        { name: 'Buns', slug: 'buns', order: 2 },
        { name: 'Pies', slug: 'pies', order: 3 },
        { name: 'Cookies', slug: 'cookies', order: 4 },
        { name: 'Cakes', slug: 'cakes', order: 5 },
        { name: 'Croissants', slug: 'croissants', order: 6 },
      ];

      for (const subcat of breadSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Bakery subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['bread-bakery'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Honey and Bee Products
    if (savedCategories['honey-bee-products']) {
      console.log('\n🍯 Creating subcategories for "Honey and Bee Products"...');

      const honeySubcategories = [
        { name: 'Honey', slug: 'honey', order: 1 },
        { name: 'Propolis', slug: 'propolis', order: 2 },
        { name: 'Bee Pollen', slug: 'bee-pollen', order: 3 },
        { name: 'Royal Jelly', slug: 'royal-jelly', order: 4 },
        { name: 'Beeswax', slug: 'beeswax', order: 5 },
        { name: 'Bee Bread', slug: 'bee-bread', order: 6 },
      ];

      for (const subcat of honeySubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Bee products subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['honey-bee-products'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Preserves
    if (savedCategories['preserves']) {
      console.log('\n🥫 Creating subcategories for "Preserves"...');

      const preserveSubcategories = [
        { name: 'Jams and Marmalades', slug: 'jams-marmalades', order: 1 },
        { name: 'Pickles', slug: 'pickles', order: 2 },
        { name: 'Marinades', slug: 'marinades', order: 3 },
        { name: 'Compotes', slug: 'compotes', order: 4 },
        { name: 'Sauces', slug: 'sauces', order: 5 },
        { name: 'Preserved Juices', slug: 'preserved-juices', order: 6 },
      ];

      for (const subcat of preserveSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Preserves subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['preserves'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Drinks
    if (savedCategories['drinks']) {
      console.log('\n🥤 Creating subcategories for "Drinks"...');

      const drinkSubcategories = [
        { name: 'Fresh Juices', slug: 'fresh-juices', order: 1 },
        { name: 'Fruit Drinks', slug: 'fruit-drinks', order: 2 },
        { name: 'Kvass', slug: 'kvass', order: 3 },
        { name: 'Herbal Teas', slug: 'herbal-teas', order: 4 },
        { name: 'Kombucha', slug: 'kombucha', order: 5 },
        { name: 'Lemonades', slug: 'lemonades', order: 6 },
      ];

      for (const subcat of drinkSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Drinks subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['drinks'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Grains and Cereals
    if (savedCategories['grains-cereals']) {
      console.log('\n🌾 Creating subcategories for "Grains and Cereals"...');

      const grainSubcategories = [
        { name: 'Buckwheat', slug: 'buckwheat', order: 1 },
        { name: 'Rice', slug: 'rice', order: 2 },
        { name: 'Oatmeal', slug: 'oatmeal', order: 3 },
        { name: 'Millet', slug: 'millet', order: 4 },
        { name: 'Barley', slug: 'barley', order: 5 },
        { name: 'Wheat', slug: 'wheat', order: 6 },
      ];

      for (const subcat of grainSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Grains subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['grains-cereals'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Nuts and Dried Fruits
    if (savedCategories['nuts-dried-fruits']) {
      console.log('\n🥜 Creating subcategories for "Nuts and Dried Fruits"...');

      const nutSubcategories = [
        { name: 'Walnuts', slug: 'walnuts', order: 1 },
        { name: 'Hazelnuts', slug: 'hazelnuts', order: 2 },
        { name: 'Almonds', slug: 'almonds', order: 3 },
        { name: 'Peanuts', slug: 'peanuts', order: 4 },
        { name: 'Dried Apricots', slug: 'dried-apricots', order: 5 },
        { name: 'Raisins', slug: 'raisins', order: 6 },
      ];

      for (const subcat of nutSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Nuts subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['nuts-dried-fruits'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Vegetable Oils
    if (savedCategories['vegetable-oils']) {
      console.log('\n🫒 Creating subcategories for "Vegetable Oils"...');

      const oilSubcategories = [
        { name: 'Sunflower Oil', slug: 'sunflower-oil', order: 1 },
        { name: 'Flaxseed Oil', slug: 'flaxseed-oil', order: 2 },
        { name: 'Pumpkin Seed Oil', slug: 'pumpkin-seed-oil', order: 3 },
        { name: 'Olive Oil', slug: 'olive-oil', order: 4 },
        { name: 'Sesame Oil', slug: 'sesame-oil', order: 5 },
        { name: 'Corn Oil', slug: 'corn-oil', order: 6 },
      ];

      for (const subcat of oilSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Vegetable oils subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['vegetable-oils'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Spices and Herbs
    if (savedCategories['spices-herbs']) {
      console.log('\n🌿 Creating subcategories for "Spices and Herbs"...');

      const spiceSubcategories = [
        { name: 'Dried Herbs', slug: 'dried-herbs', order: 1 },
        { name: 'Spices', slug: 'spices', order: 2 },
        { name: 'Tea Blends', slug: 'tea-blends', order: 3 },
        { name: 'Medicinal Herbs', slug: 'medicinal-herbs', order: 4 },
        { name: 'Seasoning Mixes', slug: 'seasoning-mixes', order: 5 },
        { name: 'Salt and Pepper', slug: 'salt-pepper', order: 6 },
      ];

      for (const subcat of spiceSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Spices subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['spices-herbs'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Farm Delicacies
    if (savedCategories['farm-delicacies']) {
      console.log('\n🍖 Creating subcategories for "Farm Delicacies"...');

      const delicacySubcategories = [
        { name: 'Sausages', slug: 'sausages', order: 1 },
        { name: 'Cheeses', slug: 'cheeses', order: 2 },
        { name: 'Pates', slug: 'pates', order: 3 },
        { name: 'Smoked Meats', slug: 'smoked-meats', order: 4 },
        { name: 'Cured Meats', slug: 'cured-meats', order: 5 },
        { name: 'Pickled Products', slug: 'pickled-products', order: 6 },
      ];

      for (const subcat of delicacySubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Farm delicacies subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['farm-delicacies'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // Subcategories for Baby Food
    if (savedCategories['baby-food']) {
      console.log('\n👶 Creating subcategories for "Baby Food"...');

      const babyFoodSubcategories = [
        { name: 'Purees', slug: 'purees', order: 1 },
        { name: 'Porridge', slug: 'porridge', order: 2 },
        { name: 'Snacks', slug: 'snacks', order: 3 },
        { name: 'Tea for Babies', slug: 'tea-for-babies', order: 4 },
        { name: 'Juices for Babies', slug: 'juices-for-babies', order: 5 },
        { name: 'Cookies for Babies', slug: 'cookies-for-babies', order: 6 },
      ];

      for (const subcat of babyFoodSubcategories) {
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "parentId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          )
        `, [
          subcat.name,
          subcat.slug,
          `Baby food subcategory: ${subcat.name}`,
          'active',
          subcat.order,
          savedCategories['baby-food'].id,
          new Date(),
          new Date()
        ]);

        console.log(`   ✅ Created subcategory: ${subcat.name}`);
      }
    }

    // 5. Final check and output of results
    console.log('\n📊 Final database state:');

    const totalCount = await dataSource.query('SELECT COUNT(*) FROM categories');
    const parentCount = await dataSource.query('SELECT COUNT(*) FROM categories WHERE "parentId" IS NULL');
    const childCount = await dataSource.query('SELECT COUNT(*) FROM categories WHERE "parentId" IS NOT NULL');

    console.log(`✅ Total categories: ${parseInt(totalCount[0].count)}`);
    console.log(`✅ Parent categories: ${parseInt(parentCount[0].count)}`);
    console.log(`✅ Child categories: ${parseInt(childCount[0].count)}`);

    console.log('\n🌳 Category structure:');

    const parents = await dataSource.query(`
      SELECT id, name, slug 
      FROM categories 
      WHERE "parentId" IS NULL 
      ORDER BY "order"
    `);

    for (const parent of parents) {
      console.log(`├── ${parent.name} (${parent.slug})`);

      const children = await dataSource.query(`
        SELECT name 
        FROM categories 
        WHERE "parentId" = $1 
        ORDER BY "order"
      `, [parent.id]);

      children.forEach((child: any, index: number) => {
        const prefix = index === children.length - 1 ? '└──' : '├──';
        console.log(`│   ${prefix} ${child.name}`);
      });
    }

    console.log('\n🎉 Categories seeding completed successfully!');

  } catch (error) {
    console.error('\n❌ CATEGORIES SEEDING FAILED:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}