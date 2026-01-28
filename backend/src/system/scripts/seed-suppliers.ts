import * as argon2 from 'argon2';
import { suppliersDataUk } from './data/suppliers.data.uk';
import { suppliersDataEn } from './data/suppliers.data.en';

export async function seedSuppliers(dataSource: any) {
  console.log('🌱 Starting suppliers seeding...');

  const password = '123456';
  const savedSuppliers = [];

  console.log('\n👥 Creating 9 suppliers with translations...');

  if (suppliersDataUk.length !== suppliersDataEn.length) {
    throw new Error('Ukrainian and English data arrays must have the same length');
  }

  for (let i = 0; i < suppliersDataUk.length; i++) {
    const supplierUk = suppliersDataUk[i];
    const supplierEn = suppliersDataEn[i];

    console.log(`[${i + 1}/9] Creating: ${supplierUk.companyName}`);

    try {
      // 1. Check if the user already exists
      const existingUser = await dataSource.query(
        `SELECT id FROM users WHERE email = $1`,
        [supplierUk.email]
      );

      let userId, supplierId;

      if (existingUser.length > 0) {
        console.log(`   ⚠️  Already exists: ${supplierUk.companyName}`);

        userId = existingUser[0].id;

        const supplierProfile = await dataSource.query(
          `SELECT id FROM suppliers WHERE user_id = $1`,
          [userId]
        );

        supplierId = supplierProfile[0]?.id;

        savedSuppliers.push({
          id: supplierId,
          userId: userId,
          ...supplierUk
        });
      } else {
        // 2. Hash the password with Argon2
        const hashedPassword = await argon2.hash(password, {
          type: argon2.argon2id,
          memoryCost: 2 ** 16,
          timeCost: 3,
          parallelism: 1
        });

        // 3. Create a user
        const userResult = await dataSource.query(`
          INSERT INTO users (
            "id", "email", "password", "roles", "status", 
            "emailVerified", "regComplete", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8
          ) RETURNING id, email
        `, [
          supplierUk.email,
          hashedPassword,
          'supplier',
          'active',
          true,
          true,
          new Date(),
          new Date()
        ]);

        userId = userResult[0].id;

        // 4. Create a supplier profile
        const supplierResult = await dataSource.query(`
          INSERT INTO suppliers (
            "id", "user_id", "companyName", "registrationNumber", 
            "phone", "firstName", "lastName", "description", 
            "documents", "status", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING id
        `, [
          userId,
          supplierUk.companyName,
          supplierUk.registrationNumber,
          supplierUk.phone,
          supplierUk.firstName,
          supplierUk.lastName,
          supplierUk.description,
          '[]',
          'approved',
          new Date(),
          new Date()
        ]);

        supplierId = supplierResult[0].id;

        savedSuppliers.push({
          id: supplierId,
          userId: userId,
          ...supplierUk
        });

        console.log(`   ✅ Created: ${supplierUk.companyName} (${supplierUk.email})`);
      }

      // 5. Add the address (if available in the data)
      if (supplierId && supplierUk.address) {
        console.log(`   🏠 Adding address for supplier ${supplierId}...`);

        await dataSource.query(`
          INSERT INTO addresses (
            "id", "entityId", "entityType", "country", "city", 
            "street", "building", "postalCode", "state", "isPrimary", 
            "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          )
        `, [
          supplierId,
          'supplier',
          supplierUk.address.country,
          supplierUk.address.city,
          supplierUk.address.street,
          supplierUk.address.building || '',
          supplierUk.address.postalCode,
          supplierUk.address.state,
          true,
          new Date(),
          new Date()
        ]);
      }

      // 6. Adding an English translation to the table
      if (supplierId) {
        console.log(`   🌐 Adding English translations for supplier ${supplierId}...`);

        const translationsData = [
          {
            entityId: supplierId,
            entityType: 'supplier',
            languageCode: 'en',
            fieldName: 'companyName',
            translationText: supplierEn.companyName
          },
          {
            entityId: supplierId,
            entityType: 'supplier',
            languageCode: 'en',
            fieldName: 'description',
            translationText: supplierEn.description
          }
        ];

        // Save each translation record
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

            console.log(`     ✅ Translation added: ${translation.fieldName} -> ${translation.languageCode}`);
          } catch (error) {
            console.error(`     ❌ Failed to add translation: ${error.message}`);
          }
        }
      }

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${savedSuppliers.length} suppliers with translations`);
  return savedSuppliers;
}