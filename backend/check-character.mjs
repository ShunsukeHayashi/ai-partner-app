import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const char = await prisma.character.findUnique({
    where: { id: '1caaba80-a8a8-4170-8171-2eb3e303c8dc' },
    select: { id: true, userId: true, name: true, sourceImagePath: true }
  });
  
  console.log(JSON.stringify(char, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
