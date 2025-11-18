import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create default admin user if not exists
  await prisma.user.upsert({
    where: { email: 'admin@hostel.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@hostel.com',
      password: hashedPassword,
      phone: '9999999999',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log('Default admin user seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });