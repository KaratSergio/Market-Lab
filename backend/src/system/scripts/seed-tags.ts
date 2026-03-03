// @ts-nocheck
import { DataSource } from 'typeorm';
import { tagsDataUk, tagsDataEn, tagsByCategory } from './data/tags.data';

export async function seedTags(dataSource: DataSource) {
  console.log('🌱 Starting tags seeding with translations...');

  try {
    // 1. Checking the connection
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // 2. First, get all categories to map slugs to IDs
    console.log('📋 Loading categories for tag-category mapping...');
    const categories = await dataSource.query(`
      SELECT id, slug, name FROM categories
    `);

    // Create a map of category slug to ID for quick lookup
    const categorySlugToId = {};
    categories.forEach(cat => {
      categorySlugToId[cat.slug] = cat.id;
    });
    console.log(`✅ Loaded ${categories.length} categories`);

    // 3. Clearing existing data
    console.log('🗑️  Clearing all existing tags and translations...');
    await dataSource.query('DELETE FROM translations WHERE "entityType" = $1', ['tag']);
    await dataSource.query('DELETE FROM tags');
    console.log('✅ All tags and translations cleared');

    // 4. Create tags with UKRAINIAN data as primary
    console.log('\n📝 Creating tags with Ukrainian data...');
    const savedTags = {};

    const tagEntries = Object.entries(tagsDataUk);
    for (let i = 0; i < tagEntries.length; i++) {
      const [slug, tagDataUk] = tagEntries[i];
      const tagDataEn = tagsDataEn[slug];

      console.log(`[${i + 1}/${tagEntries.length}] Creating tag: ${tagDataUk.name}`);

      try {
        // Generate UUID for tag
        const tagId = crypto.randomUUID();

        // Find which category this tag belongs to
        let categoryId = null;
        for (const [catSlug, tagSlugs] of Object.entries(tagsByCategory)) {
          if (tagSlugs.includes(slug)) {
            categoryId = categorySlugToId[catSlug];
            if (categoryId) {
              console.log(`   📌 Tag belongs to category: ${catSlug} (ID: ${categoryId})`);
            }
            break;
          }
        }

        // Insert tag with UKRAINIAN data (primary) and categoryId
        await dataSource.query(`
          INSERT INTO tags (
            "id", "name", "slug", "description", "status", 
            "usageCount", "categoryId", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          tagId,
          tagDataUk.name,
          slug,
          tagDataUk.description,
          'active',
          0, // Initial usage count
          categoryId, // 👈 Добавляем categoryId
          new Date(),
          new Date()
        ]);

        // Save tag info for reference
        savedTags[slug] = {
          id: tagId,
          name: tagDataUk.name,
          slug: slug,
          categoryId: categoryId
        };

        // Insert ENGLISH translations if available
        if (tagDataEn) {
          await insertTagTranslations(dataSource, tagId, tagDataEn, 'en');
          console.log(`   ✅ Created with EN translations: ${tagDataUk.name} (ID: ${tagId})`);
        } else {
          console.log(`   ✅ Created (UK only): ${tagDataUk.name} (ID: ${tagId})`);
        }

      } catch (error) {
        console.error(`   ❌ Failed to create tag ${tagDataUk.name}:`, error.message);
        throw error;
      }
    }

    // 5. Verify category assignments
    console.log('\n📊 Verifying category assignments...');
    const tagsWithCategories = await dataSource.query(`
      SELECT 
        t.name as tag_name,
        t.slug as tag_slug,
        c.name as category_name,
        c.slug as category_slug
      FROM tags t
      LEFT JOIN categories c ON t."categoryId" = c.id
      ORDER BY c.name, t.name
    `);

    const assignedCount = tagsWithCategories.filter(t => t.category_name).length;
    console.log(`✅ Tags with category assigned: ${assignedCount}/${tagsWithCategories.length}`);

    if (assignedCount < tagsWithCategories.length) {
      console.log('⚠️  Tags without category:');
      tagsWithCategories
        .filter(t => !t.category_name)
        .forEach(t => console.log(`   - ${t.tag_name} (${t.tag_slug})`));
    }

    // 6. Final statistics
    console.log('\n📊 Final database state:');

    const totalTags = await dataSource.query('SELECT COUNT(*) FROM tags');
    const activeTags = await dataSource.query('SELECT COUNT(*) FROM tags WHERE status = $1', ['active']);
    const translationsCount = await dataSource.query('SELECT COUNT(*) FROM translations WHERE "entityType" = $1', ['tag']);

    console.log(`✅ Total tags created: ${parseInt(totalTags[0].count)}`);
    console.log(`✅ Active tags: ${parseInt(activeTags[0].count)}`);
    console.log(`✅ English translations created: ${parseInt(translationsCount[0].count)}`);

    // 7. Display tags with translation info
    await displayTagsWithTranslations(dataSource);

    console.log('\n🎉 Tags seeding with translations completed successfully!');

  } catch (error) {
    console.error('\n❌ TAGS SEEDING FAILED:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

/**
 * Inserts translations for a tag
 */
async function insertTagTranslations(
  dataSource: DataSource,
  tagId: string,
  translationData: {
    name: string;
    description?: string;
  },
  languageCode: string = 'en'
): Promise<void> {
  const translations = [
    { fieldName: 'name', translationText: translationData.name },
    { fieldName: 'description', translationText: translationData.description || '' }
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
        tagId,
        'tag',
        languageCode,
        translation.fieldName,
        translation.translationText,
        new Date(),
        new Date()
      ]);
    }
  }
}

/**
 * Displays tags with translation info
 */
async function displayTagsWithTranslations(dataSource: DataSource) {
  console.log('\n🏷️  Tags created (with English translations status):');

  // Get all tags with their translation status and category
  const tags = await dataSource.query(`
    SELECT 
      t.id, 
      t.name, 
      t.slug, 
      t.status,
      c.name as category_name,
      (SELECT COUNT(*) FROM translations tr 
        WHERE tr."entityId" = t.id AND tr."entityType" = 'tag' 
        AND tr."languageCode" = 'en') as english_translations_count
    FROM tags t
    LEFT JOIN categories c ON t."categoryId" = c.id
    ORDER BY c.name, t.name
  `);

  // Group tags by category for better display
  let currentCategory = '';
  tags.forEach(tag => {
    const categoryName = tag.category_name || 'Без категорії';
    if (categoryName !== currentCategory) {
      currentCategory = categoryName;
      console.log(`\n📁 ${categoryName}:`);
    }

    const hasEnglishTranslations = parseInt(tag.english_translations_count) > 0;
    const translationIcon = hasEnglishTranslations ? '🇺🇸' : '❌';
    const statusIcon = tag.status === 'active' ? '✅' : '⏸️';

    console.log(`  ${statusIcon} ${translationIcon} ${tag.name} (${tag.slug})`);
  });

  // Show statistics by category from tagsByCategory mapping
  console.log('\n📈 Tags by category (from mapping):');

  for (const [category, slugs] of Object.entries(tagsByCategory)) {
    console.log(`  ${category}: ${slugs.length} tags`);
  }
}