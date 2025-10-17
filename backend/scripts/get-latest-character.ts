/**
 * Get the most recently created character for testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const characters = await prisma.character.findMany({
    where: { userId: 'dev-user-001' },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  if (characters.length === 0) {
    console.log('No characters found for dev-user-001');
    return;
  }

  const character = characters[0];
  console.log('Latest Character:');
  console.log('=================');
  console.log('ID:', character.id);
  console.log('Name:', character.name);
  console.log('Age:', character.age);
  console.log('Source Image Path:', character.sourceImagePath);
  console.log('Appearance Style:', character.appearanceStyle);
  console.log('Created At:', character.createdAt);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
