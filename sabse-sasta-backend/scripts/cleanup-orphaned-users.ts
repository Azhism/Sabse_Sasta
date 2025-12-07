import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupOrphanedUsers() {
  console.log('🔍 Checking for orphaned user records...');

  try {
    // Find all users with user_type = 'vendor'
    const vendorUsers = await prisma.users.findMany({
      where: {
        user_type: 'vendor',
      },
      include: {
        vendors: true,
      },
    });

    console.log(`Total vendor users in database: ${vendorUsers.length}`);

    // Find orphaned users (vendor users without a vendor profile)
    const orphanedUsers = vendorUsers.filter(user => !user.vendors);

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found. Database is clean!');
      
      // Show all users for debugging
      const allUsers = await prisma.users.findMany({
        select: {
          user_id: true,
          email: true,
          name: true,
          user_type: true,
        },
      });
      console.log('\nAll users in database:');
      allUsers.forEach(user => {
        console.log(`   - ID: ${user.user_id}, Email: ${user.email}, Name: ${user.name}, Type: ${user.user_type}`);
      });
      return;
    }

    console.log(`⚠️  Found ${orphanedUsers.length} orphaned user(s) (vendor users without vendor profile):`);
    orphanedUsers.forEach(user => {
      console.log(`   - User ID: ${user.user_id}, Email: ${user.email}, Name: ${user.name}`);
    });

    // Delete orphaned users
    for (const user of orphanedUsers) {
      await prisma.users.delete({
        where: { user_id: user.user_id },
      });
      console.log(`   ✅ Deleted orphaned user: ${user.email}`);
    }

    console.log('\n🎉 Cleanup complete! You can now sign up as a vendor.');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedUsers();
