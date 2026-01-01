/**
 * Migration Script: Convert Legacy String IDs to UUID
 * 
 * This script:
 * 1. Finds SupplierProfile records with non-UUID IDs
 * 2. Creates new records with UUID IDs
 * 3. Updates SupplierUser.supplierId references
 * 4. Updates SupplierRequestAssignment.supplierId references
 * 5. Deletes old records
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function migrateSupplierIds() {
  console.log('🔄 Starting Legacy ID Migration...\n');

  // Step 1: Find all SupplierProfile records with non-UUID IDs
  const allProfiles = await prisma.supplierProfile.findMany();
  const legacyProfiles = allProfiles.filter(p => !isValidUUID(p.id));

  console.log(`📊 Found ${allProfiles.length} SupplierProfile records`);
  console.log(`📊 Found ${legacyProfiles.length} records with legacy IDs\n`);

  if (legacyProfiles.length === 0) {
    console.log('✅ No legacy IDs found. All IDs are already UUIDs.');
    return;
  }

  for (const profile of legacyProfiles) {
    const oldId = profile.id;
    const newId = uuidv4();

    console.log(`\n🔄 Migrating: ${oldId} → ${newId}`);
    console.log(`   Company: ${profile.companyName}`);

    try {
      // Step 2: Check for existing SupplierUser references
      const supplierUsers = await prisma.supplierUser.findMany({
        where: { supplierId: oldId }
      });
      console.log(`   Found ${supplierUsers.length} SupplierUser references`);

      // Step 3: Check for existing SupplierRequestAssignment references
      const assignments = await prisma.supplierRequestAssignment.findMany({
        where: { supplierId: oldId }
      });
      console.log(`   Found ${assignments.length} SupplierRequestAssignment references`);

      // Step 4: Use transaction to ensure atomicity
      await prisma.$transaction(async (tx) => {
        // 4a: Create new SupplierProfile with UUID
        await tx.supplierProfile.create({
          data: {
            id: newId,
            customerId: profile.customerId,
            companyName: profile.companyName,
            contactName: profile.contactName,
            contactPhone: profile.contactPhone,
            contactEmail: profile.contactEmail,
            categories: profile.categories,
            regions: profile.regions,
            rating: profile.rating,
            totalRevenue: profile.totalRevenue,
            status: profile.status,
            supplierType: profile.supplierType,
            groupId: profile.groupId,
            customMarginPercent: profile.customMarginPercent,
            country: profile.country,
            city: profile.city,
            vatNumber: profile.vatNumber,
            crNumber: profile.crNumber,
            preferredCurrency: profile.preferredCurrency,
            allowedCurrencies: profile.allowedCurrencies,
            shippingOriginCity: profile.shippingOriginCity,
            languageHint: profile.languageHint,
            createdAt: profile.createdAt,
          }
        });
        console.log(`   ✅ Created new SupplierProfile with UUID`);

        // 4b: Update SupplierUser references
        for (const su of supplierUsers) {
          await tx.supplierUser.update({
            where: { id: su.id },
            data: { supplierId: newId }
          });
        }
        if (supplierUsers.length > 0) {
          console.log(`   ✅ Updated ${supplierUsers.length} SupplierUser references`);
        }

        // 4c: Update SupplierRequestAssignment references
        for (const assignment of assignments) {
          await tx.supplierRequestAssignment.update({
            where: { id: assignment.id },
            data: { supplierId: newId }
          });
        }
        if (assignments.length > 0) {
          console.log(`   ✅ Updated ${assignments.length} SupplierRequestAssignment references`);
        }

        // 4d: Delete old SupplierProfile
        await tx.supplierProfile.delete({
          where: { id: oldId }
        });
        console.log(`   ✅ Deleted old SupplierProfile with legacy ID`);
      });

      console.log(`   ✅ Migration successful for ${oldId}`);
    } catch (error) {
      console.error(`   ❌ Migration failed for ${oldId}:`, error);
    }
  }

  console.log('\n🎉 Migration completed!');

  // Verify results
  const verifyProfiles = await prisma.supplierProfile.findMany();
  const stillLegacy = verifyProfiles.filter(p => !isValidUUID(p.id));

  console.log(`\n📊 Verification:`);
  console.log(`   Total SupplierProfiles: ${verifyProfiles.length}`);
  console.log(`   Still with legacy IDs: ${stillLegacy.length}`);

  if (stillLegacy.length === 0) {
    console.log('   ✅ All IDs are now UUIDs!');
  } else {
    console.log('   ⚠️ Some legacy IDs could not be migrated:');
    stillLegacy.forEach(p => console.log(`      - ${p.id}: ${p.companyName}`));
  }
}

async function main() {
  try {
    await migrateSupplierIds();
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
