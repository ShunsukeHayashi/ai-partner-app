/**
 * Check character's image URLs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const CHARACTER_ID = '51d9a462-3c15-412e-8d1d-b66056d80f68';

async function main() {
  const character = await prisma.character.findUnique({
    where: { id: CHARACTER_ID },
  });

  if (!character) {
    console.log('Character not found');
    return;
  }

  console.log('Character Image Status:');
  console.log('======================');
  console.log('Name:', character.name);
  console.log('');
  console.log('📁 Source Image (uploaded):');
  console.log('  Path:', character.sourceImagePath || 'Not set');
  console.log('');
  console.log('🎨 Primary Image (generated):');
  console.log('  URL:', character.primaryImageUrl || 'Not generated yet');
  console.log('  Generated:', character.imagesGenerated ? 'Yes' : 'No');
  console.log('  Last Generated:', character.lastGeneratedAt || 'Never');
  console.log('');
  console.log('😊 Expression Images:');
  if (character.expressionUrls && typeof character.expressionUrls === 'object') {
    const expressions = character.expressionUrls as Record<string, string>;
    const expressionCount = Object.keys(expressions).length;
    console.log('  Count:', expressionCount);
    if (expressionCount > 0) {
      Object.entries(expressions).forEach(([expr, url]) => {
        console.log(`  - ${expr}: ${url}`);
      });
    }
  } else {
    console.log('  None generated yet');
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
