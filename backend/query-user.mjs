import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'dev-user-001' },
    select: { id: true, email: true, username: true }
  });
  
  console.log(JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
