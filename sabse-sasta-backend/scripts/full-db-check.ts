import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fullDatabaseCheck() {
  console.log('=== ALL USERS ===');
  const allUsers = await prisma.users.findMany({ 
    orderBy: { user_id: 'asc' } 
  });
  allUsers.forEach(u => console.log(`User ID: ${u.user_id}, Email: ${u.email}, Type: ${u.user_type}`));
  
  console.log('\n=== ALL VENDORS ===');
  const allVendors = await prisma.vendors.findMany({ 
    orderBy: { vendor_id: 'asc' } 
  });
  allVendors.forEach(v => console.log(`Vendor ID: ${v.vendor_id}, User ID: ${v.user_id}, Name: ${v.vendor_name}`));
  
  console.log('\n=== CHECKING FOR GAPS ===');
  const vendorUserIds = allVendors.map(v => v.user_id);
  const vendorTypeUsers = allUsers.filter(u => u.user_type === 'vendor');
  
  vendorTypeUsers.forEach(u => {
    const hasVendorProfile = vendorUserIds.includes(u.user_id);
    console.log(`User ${u.user_id} (${u.email}): ${hasVendorProfile ? '✅ HAS vendor profile' : '❌ MISSING vendor profile'}`);
  });
  
  await prisma.$disconnect();
}

fullDatabaseCheck();
