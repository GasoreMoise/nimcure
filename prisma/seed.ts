import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user if it doesn't exist
  const adminEmail = 'admin@medtrack.com';
  const adminPassword = 'admin123'; // Change this in production

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: bcrypt.hashSync(adminPassword, 10),
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '1234567890',
        licenseNumber: 'ADMIN-LICENSE',
        emailVerified: new Date()
      }
    });
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect()); 