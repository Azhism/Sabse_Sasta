import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createVendorProfiles() {
  try {
    // Find all users with user_type = 'vendor'
    const vendorUsers = await prisma.users.findMany({
      where: {
        user_type: 'vendor',
      },
    });

    console.log(`Found ${vendorUsers.length} vendor users`);

    for (const user of vendorUsers) {
      // Check if vendor profile already exists
      const existingVendor = await prisma.vendors.findUnique({
        where: {
          user_id: user.user_id,
        },
      });

      if (existingVendor) {
        console.log(`Vendor profile already exists for user ${user.email}`);
        continue;
      }

      // Create vendor profile
      const vendor = await prisma.vendors.create({
        data: {
          user_id: user.user_id,
          vendor_name: user.name,
          contact_email: user.email,
          is_verified: true,
        },
      });

      console.log(`✅ Created vendor profile for ${user.email} (vendor_id: ${vendor.vendor_id})`);
    }

    console.log('\n✅ Done! All vendor users now have vendor profiles.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createVendorProfiles();
