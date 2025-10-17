/**
 * Test image generation for a character
 */

import fetch from 'node-fetch';

const CHARACTER_ID = '51d9a462-3c15-412e-8d1d-b66056d80f68';
const API_URL = 'http://localhost:3001';

async function testImageGeneration() {
  console.log('Testing image generation for character:', CHARACTER_ID);
  console.log('=====================================\n');

  try {
    const response = await fetch(
      `${API_URL}/api/characters/${CHARACTER_ID}/generate-image`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', errorText);
      return;
    }

    const result = await response.json();
    console.log('\nSuccess! Image generated:');
    console.log('Image URL:', result.imageUrl);
    console.log('Message:', result.message);
  } catch (error) {
    console.error('Request failed:', error);
  }
}

testImageGeneration();
