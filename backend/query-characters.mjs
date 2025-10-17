import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const characters = await prisma.character.findMany({
    where: {
      sourceImagePath: { not: null }
    },
    select: {
      id: true,
      name: true,
      sourceImagePath: true,
      userId: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  
  console.log(JSON.stringify(characters, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
