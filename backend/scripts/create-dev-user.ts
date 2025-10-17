/**
 * Create development user for testing without authentication
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const devUserId = 'dev-user-001';
  const devEmail = 'dev@example.com';
  const devUsername = 'devuser';
  // Dummy password hash (bcrypt hash of 'devpassword123')
  const dummyPasswordHash = '$2b$10$abcdefghijklmnopqrstuv.wxyz1234567890ABCDEFGHIJKLMNO';

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: devUserId },
  });

  if (existingUser) {
    console.log('✅ Development user already exists:', {
      id: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
    });
    return;
  }

  // Create development user with fixed ID
  const user = await prisma.user.create({
    data: {
      id: devUserId,
      email: devEmail,
      username: devUsername,
      password: dummyPasswordHash,
    },
  });

  console.log('✅ Development user created successfully:', {
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error creating development user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
