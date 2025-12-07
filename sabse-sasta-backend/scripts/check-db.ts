import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  const maxUser = await prisma.users.findFirst({ orderBy: { user_id: 'desc' } });
  const maxVendor = await prisma.vendors.findFirst({ orderBy: { user_id: 'desc' } });
  
  console.log('Max user_id in users table:', maxUser?.user_id);
  console.log('Max user_id in vendors table:', maxVendor?.user_id);
  
  const allVendors = await prisma.vendors.findMany({ 
    select: { vendor_id: true, user_id: true, vendor_name: true } 
  });
  console.log('\nAll vendors:', JSON.stringify(allVendors, null, 2));
  
  await prisma.$disconnect();
}

checkDatabase();
