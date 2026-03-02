// @ts-nocheck
import { DataSource } from 'typeorm';
import { tagsDataUk, tagsDataEn } from './data/tags.data';

export async function seedTags(dataSource: DataSource) {
  console.log('🌱 Starting tags seeding with translations...');

  try {
    // 1. Checking the connection
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }

    // 2. Clearing existing data
    console.log('🗑️  Clearing all existing tags and translations...');
    await dataSource.query('DELETE FROM translations WHERE "entityType" = $1', ['tag']);
    await dataSource.query('DELETE FROM tags');
    console.log('✅ All tags and translations cleared');

    // 3. Create tags with UKRAINIAN data as primary
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

        // Insert tag with UKRAINIAN data (primary)
        await dataSource.query(`
          INSERT INTO tags (
            "id", "name", "slug", "description", "status", "usageCount", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          tagId,
          tagDataUk.name,
          slug,
          tagDataUk.description,
          'active',
          0, // Initial usage count
          new Date(),
          new Date()
        ]);

        // Save tag info for reference
        savedTags[slug] = {
          id: tagId,
          name: tagDataUk.name,
          slug: slug
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

    // 4. Final statistics
    console.log('\n📊 Final database state:');

    const totalTags = await dataSource.query('SELECT COUNT(*) FROM tags');
    const activeTags = await dataSource.query('SELECT COUNT(*) FROM tags WHERE status = $1', ['active']);
    const translationsCount = await dataSource.query('SELECT COUNT(*) FROM translations WHERE "entityType" = $1', ['tag']);

    console.log(`✅ Total tags created: ${parseInt(totalTags[0].count)}`);
    console.log(`✅ Active tags: ${parseInt(activeTags[0].count)}`);
    console.log(`✅ English translations created: ${parseInt(translationsCount[0].count)}`);

    // 5. Display tags with translation info
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

  // Get all tags with their translation status
  const tags = await dataSource.query(`
    SELECT t.id, t.name, t.slug, t.status,
    (SELECT COUNT(*) FROM translations tr 
     WHERE tr."entityId" = t.id AND tr."entityType" = 'tag' 
     AND tr."languageCode" = 'en') as english_translations_count
    FROM tags t
    ORDER BY t.name
  `);

  // Group tags by first letter for better display
  let currentLetter = '';
  tags.forEach(tag => {
    const firstLetter = tag.name.charAt(0).toUpperCase();
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      console.log(`\n${currentLetter}:`);
    }

    const hasEnglishTranslations = parseInt(tag.english_translations_count) > 0;
    const translationIcon = hasEnglishTranslations ? '🇺🇸' : '❌';
    const statusIcon = tag.status === 'active' ? '✅' : '⏸️';

    console.log(`  ${statusIcon} ${translationIcon} ${tag.name} (${tag.slug})`);
  });

  // Show statistics by category
  console.log('\n📈 Tags by category:');

  const categories = {
    'vegetables': ['fresh-vegetables', 'organic', 'seasonal', 'root-vegetables', 'leafy-greens', 'nightshades', 'cruciferous', 'cucurbits', 'alliums'],
    'fruits': ['berries', 'stone-fruits', 'pome-fruits', 'tropical-fruits'],
    'dairy': ['farm-milk', 'goat-dairy', 'artisan-cheese', 'fermented-dairy', 'farm-butter'],
    'meat': ['free-range', 'grass-fed', 'farm-pork', 'farm-beef', 'farm-chicken', 'rabbit-meat', 'homemade-sausages', 'cured-meats'],
    'honey': ['raw-honey', 'monofloral-honey', 'polyfloral-honey', 'propolis', 'bee-pollen', 'royal-jelly', 'beeswax'],
    'bakery': ['sourdough-bread', 'whole-grain', 'rye-bakery', 'handmade-pastries', 'no-preservatives'],
    'grains': ['buckwheat', 'ancient-grains', 'gluten-free-grains', 'farm-flour'],
    'preserves': ['homemade-jam', 'fermented', 'pickles', 'natural-compotes', 'preserved-juices'],
    'drinks': ['fresh-juices', 'herbal-teas', 'farm-kvass', 'kombucha'],
    'nuts': ['raw-nuts', 'dried-fruits', 'nuts-mixes'],
    'oils': ['cold-pressed', 'unrefined-oils', 'pumpkin-seed-oil', 'flaxseed-oil'],
    'spices': ['dried-herbs', 'medicinal-herbs', 'spice-blends', 'natural-salt'],
    'baby': ['baby-purees', 'baby-cereals', 'baby-snacks'],
    'delicacies': ['farm-delicacies', 'pates', 'smoked-products', 'marinated-products'],
    'quality': ['premium', 'farmers-choice', 'limited-edition', 'family-recipe', 'award-winning']
  };

  for (const [category, slugs] of Object.entries(categories)) {
    const count = tags.filter(tag => slugs.includes(tag.slug)).length;
    if (count > 0) {
      console.log(`  ${category}: ${count} tags`);
    }
  }
}