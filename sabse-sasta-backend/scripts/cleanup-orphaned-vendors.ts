import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedVendors() {
  console.log('🔍 Checking for orphaned vendor records...');

  try {
    // Find all vendors
    const allVendors = await prisma.vendors.findMany({
      include: {
        users: true,
      },
    });

    console.log(`Total vendors in database: ${allVendors.length}`);

    // Find orphaned vendors (vendors without a user)
    const orphanedVendors = allVendors.filter(vendor => !vendor.users);

    if (orphanedVendors.length === 0) {
      console.log('✅ No orphaned vendors found. Database is clean!');
      return;
    }

    console.log(`⚠️  Found ${orphanedVendors.length} orphaned vendor(s):`);
    orphanedVendors.forEach(vendor => {
      console.log(`   - Vendor ID: ${vendor.vendor_id}, Name: ${vendor.vendor_name}, User ID: ${vendor.user_id}`);
    });

    // Delete orphaned vendors
    for (const vendor of orphanedVendors) {
      await prisma.vendors.delete({
        where: { vendor_id: vendor.vendor_id },
      });
      console.log(`   ✅ Deleted orphaned vendor: ${vendor.vendor_name}`);
    }

    console.log('\n🎉 Cleanup complete! You can now sign up as a vendor.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedVendors();
