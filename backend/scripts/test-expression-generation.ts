/**
 * Test expression generation (I2I) for a character
 */

import fetch from 'node-fetch';

const CHARACTER_ID = '51d9a462-3c15-412e-8d1d-b66056d80f68';
const API_URL = 'http://localhost:3001';

async function testExpressionGeneration() {
  console.log('Testing expression generation (I2I) for character:', CHARACTER_ID);
  console.log('=======================================================\n');

  // Test different expressions
  const expressions = [
    { name: 'happy', description: 'Bright smile, joyful eyes' },
    { name: 'surprised', description: 'Wide eyes, open mouth slightly' },
    { name: 'sad', description: 'Downcast eyes, slight frown' },
  ];

  for (const expr of expressions) {
    console.log(`\n🎭 Generating "${expr.name}" expression...`);
    console.log(`   Description: ${expr.description}`);

    try {
      const response = await fetch(
        `${API_URL}/api/characters/${CHARACTER_ID}/generate-expression`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            expression: expr.name,
            customPrompt: expr.description,
          }),
        }
      );

      console.log(`   Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('   ❌ Error:', errorText);
        continue;
      }

      const result = await response.json();
      console.log('   ✅ Success!');
      console.log('   Image URL:', result.imageUrl.substring(0, 80) + '...');
      console.log('   Used Custom Prompt:', result.usedCustomPrompt);

      // Wait a bit between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('   ❌ Request failed:', error);
    }
  }

  console.log('\n\n📊 Final Status:');
  console.log('===============');

  // Check final state
  const checkResponse = await fetch(`${API_URL}/api/characters/${CHARACTER_ID}`);
  if (checkResponse.ok) {
    const { character } = await checkResponse.json();
    console.log('Expression count:', Object.keys(character.expressionUrls || {}).length);
    console.log('Generated expressions:', Object.keys(character.expressionUrls || {}).join(', '));
  }
}

testExpressionGeneration();
