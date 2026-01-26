import * as argon2 from 'argon2';
import { suppliersDataUk } from './data/suppliers.data.uk';

export async function seedSuppliers(dataSource: any) {
  console.log('🌱 Starting suppliers seeding...');

  const password = '123456';
  const savedSuppliers = [];

  console.log('\n👥 Creating 9 suppliers...');

  for (let i = 0; i < suppliersDataUk.length; i++) {
    const supplier = suppliersDataUk[i];
    console.log(`[${i + 1}/9] Creating: ${supplier.companyName}`);

    try {
      // 1. Check if the user already exists
      const existingUser = await dataSource.query(
        `SELECT id FROM users WHERE email = $1`,
        [supplier.email]
      );

      if (existingUser.length > 0) {
        console.log(`   ⚠️  Already exists: ${supplier.companyName}`);

        const supplierProfile = await dataSource.query(
          `SELECT id FROM suppliers WHERE user_id = $1`,
          [existingUser[0].id]
        );

        savedSuppliers.push({
          id: supplierProfile[0]?.id,
          userId: existingUser[0].id,
          ...supplier
        });
        continue;
      }

      // 2. Hash the password with Argon2
      const hashedPassword = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64MB
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
        supplier.email,
        hashedPassword,
        'supplier',
        'active',
        true,
        true,
        new Date(),
        new Date()
      ]);

      const userId = userResult[0].id;

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
        supplier.companyName,
        supplier.registrationNumber,
        supplier.phone,
        supplier.firstName,
        supplier.lastName,
        supplier.description,
        '[]',
        'approved',
        new Date(),
        new Date()
      ]);

      savedSuppliers.push({
        id: supplierResult[0].id,
        userId: userId,
        ...supplier
      });

      console.log(`   ✅ Created: ${supplier.companyName} (${supplier.email})`);

    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    }
  }

  console.log(`\n✅ Created ${savedSuppliers.length} suppliers`);
  return savedSuppliers;
}