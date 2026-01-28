// @ts-nocheck
import { DataSource } from 'typeorm';
import { mainCategoriesDataEn, subcategoriesDataEn } from './data/categories.data.en';
import { mainCategoriesDataUk, subcategoriesDataUk } from './data/categories.data.uk';

export async function seedCategories(dataSource: DataSource) {
  console.log('🌱 Starting categories seeding with translations...');

  try {
    // 1. Checking the connection
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // 2. Clearing existing data
    console.log('🗑️  Clearing all existing data...');
    await dataSource.query('DELETE FROM translations WHERE "entityType" = $1', ['category']);
    await dataSource.query('DELETE FROM categories');
    console.log('✅ All categories and translations cleared');

    // 3. Create main (parent) categories with UKRAINIAN data as primary
    console.log('\n📝 Creating main categories with Ukrainian data...');
    const savedCategories = {};

    for (let i = 0; i < mainCategoriesDataUk.length; i++) {
      const catDataUk = mainCategoriesDataUk[i];
      const catDataEn = mainCategoriesDataEn.find(c => c.slug === catDataUk.slug);

      console.log(`[${i + 1}/${mainCategoriesDataUk.length}] Creating: ${catDataUk.name}`);

      try {
        // Generate UUID for category
        const categoryId = crypto.randomUUID();

        // Insert category with UKRAINIAN data (primary)
        await dataSource.query(`
          INSERT INTO categories (
            "id", "name", "slug", "description", "status", "order", 
            "metaTitle", "metaDescription", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          categoryId,
          catDataUk.name,
          catDataUk.slug,
          catDataUk.description,
          'active',
          catDataUk.order,
          catDataUk.metaTitle || catDataUk.name,
          catDataUk.metaDescription || catDataUk.description,
          new Date(),
          new Date()
        ]);

        // Save category info for creating subcategories
        savedCategories[catDataUk.slug] = {
          id: categoryId,
          name: catDataUk.name,
          slug: catDataUk.slug
        };

        // Insert ENGLISH translations if available
        if (catDataEn) {
          await insertCategoryTranslations(dataSource, categoryId, catDataEn, 'en');
          console.log(`   ✅ Created with EN translations: ${catDataUk.name} (ID: ${categoryId})`);
        } else {
          console.log(`   ✅ Created (UK only): ${catDataUk.name} (ID: ${categoryId})`);
        }

      } catch (error) {
        console.error(`   ❌ Failed to create category ${catDataUk.name}:`, error.message);
        throw error;
      }
    }

    console.log(`\n✅ Created ${mainCategoriesDataUk.length} main categories`);

    // 4. Creating subcategories with Ukrainian data as primary
    console.log('\n📝 Creating subcategories with Ukrainian data...');
    let totalSubcategories = 0;

    for (const mainCategorySlug in subcategoriesDataUk) {
      if (savedCategories[mainCategorySlug]) {
        const parentCategory = savedCategories[mainCategorySlug];
        const subcategoriesUk = subcategoriesDataUk[mainCategorySlug];
        const subcategoriesEn = subcategoriesDataEn?.[mainCategorySlug] || [];

        console.log(`\n📋 Creating subcategories for "${parentCategory.name}"...`);

        for (let i = 0; i < subcategoriesUk.length; i++) {
          const subcatUk = subcategoriesUk[i];
          const subcatEn = subcategoriesEn[i] || { name: subcatUk.name };

          const subcategoryId = crypto.randomUUID();

          // Find English subcategory with matching slug
          const matchingEnSubcat = subcategoriesEn.find(s => s.slug === subcatUk.slug);

          try {
            // Insert subcategory with UKRAINIAN data (primary)
            await dataSource.query(`
              INSERT INTO categories (
                "id", "name", "slug", "description", "status", "order", 
                "parentId", "createdAt", "updatedAt"
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              subcategoryId,
              subcatUk.name,
              subcatUk.slug,
              `Підкатегорія ${parentCategory.name}: ${subcatUk.name}`,
              'active',
              subcatUk.order,
              parentCategory.id,
              new Date(),
              new Date()
            ]);

            // Insert ENGLISH translations for subcategory
            const enSubcatData = {
              name: matchingEnSubcat?.name || subcatEn.name,
              slug: subcatUk.slug,
              description: matchingEnSubcat?.description || `Subcategory of ${parentCategory.name}: ${subcatEn.name}`
            };

            await insertCategoryTranslations(dataSource, subcategoryId, enSubcatData, 'en');

            console.log(`   ✅ Created subcategory: ${subcatUk.name}`);
            totalSubcategories++;

          } catch (error) {
            console.error(`   ❌ Failed to create subcategory ${subcatUk.name}:`, error.message);
            throw error;
          }
        }
      } else {
        console.log(`⚠️  Parent category not found for slug: ${mainCategorySlug}`);
      }
    }

    // 5. Final statistics
    console.log('\n📊 Final database state:');

    const totalCategories = await dataSource.query('SELECT COUNT(*) FROM categories');
    const parentCategories = await dataSource.query('SELECT COUNT(*) FROM categories WHERE "parentId" IS NULL');
    const childCategories = await dataSource.query('SELECT COUNT(*) FROM categories WHERE "parentId" IS NOT NULL');
    const translationsCount = await dataSource.query('SELECT COUNT(*) FROM translations WHERE "entityType" = $1', ['category']);

    console.log(`✅ Total categories: ${parseInt(totalCategories[0].count)}`);
    console.log(`✅ Parent categories: ${parseInt(parentCategories[0].count)}`);
    console.log(`✅ Child categories: ${parseInt(childCategories[0].count)}`);
    console.log(`✅ English translations created: ${parseInt(translationsCount[0].count)}`);
    console.log(`✅ Subcategories created: ${totalSubcategories}`);

    // 6. Display category tree with translations info
    await displayCategoryTreeWithTranslations(dataSource);

    console.log('\n🎉 Categories seeding with translations completed successfully!');

  } catch (error) {
    console.error('\n❌ CATEGORIES SEEDING FAILED:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

/**
 * Inserts translations for a category
 */
async function insertCategoryTranslations(
  dataSource: DataSource,
  categoryId: string,
  translationData: {
    name: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
  },
  languageCode: string = 'en'
): Promise<void> {
  const translations = [
    { fieldName: 'name', translationText: translationData.name },
    { fieldName: 'description', translationText: translationData.description || '' },
    { fieldName: 'metaTitle', translationText: translationData.metaTitle || translationData.name },
    { fieldName: 'metaDescription', translationText: translationData.metaDescription || translationData.description || '' }
  ];

  for (const translation of translations) {
    if (translation.translationText) {
      await dataSource.query(`
        INSERT INTO translations (
          "id", "entityId", "entityType", "languageCode", 
          "fieldName", "translationText", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        crypto.randomUUID(),
        categoryId,
        'category',
        languageCode, // 'en'
        translation.fieldName,
        translation.translationText,
        new Date(),
        new Date()
      ]);
    }
  }
}

/**
 * Displays category tree with translation info
 */
async function displayCategoryTreeWithTranslations(dataSource: DataSource) {
  console.log('\n🌳 Category structure (Ukrainian primary with English translations):');

  const parents = await dataSource.query(`
    SELECT c.id, c.name, c.slug,
    (SELECT COUNT(*) FROM translations t 
    WHERE t."entityId" = c.id AND t."entityType" = 'category' 
    AND t."languageCode" = 'en') as english_translations_count
    FROM categories c 
    WHERE c."parentId" IS NULL 
    ORDER BY c."order"
  `);

  for (const parent of parents) {
    const hasEnglishTranslations = parseInt(parent.english_translations_count) > 0;
    const translationIcon = hasEnglishTranslations ? '🇺🇸' : '❌';

    console.log(`├── ${parent.name} ${translationIcon} (${parent.slug})`);

    const children = await dataSource.query(`
      SELECT c.name, c.slug,
      (SELECT COUNT(*) FROM translations t 
      WHERE t."entityId" = c.id AND t."entityType" = 'category'
      AND t."languageCode" = 'en') as english_translations_count
      FROM categories c 
      WHERE c."parentId" = $1 
      ORDER BY c."order"
    `, [parent.id]);

    children.forEach((child, index) => {
      const prefix = index === children.length - 1 ? '└──' : '├──';
      const childHasEnglishTranslations = parseInt(child.english_translations_count) > 0;
      const childTranslationIcon = childHasEnglishTranslations ? '🇺🇸' : '❌';

      console.log(`│   ${prefix} ${child.name} ${childTranslationIcon} (${child.slug})`);
    });
  }
}