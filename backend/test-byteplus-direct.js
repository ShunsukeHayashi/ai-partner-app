// Direct BytePlus API test - bypass our backend
async function testBytePlusDirect() {
  const endpoint = 'https://ark.ap-southeast-1.bytepluses.com/api/v3';
  const apiKey = 'fdc9e681-e525-4122-9ed1-2d896f2cb11c';
  const model = 'seedream-3-0-t2i-250415';

  console.log('Testing BytePlus API directly...');
  console.log('Endpoint:', endpoint + '/images/generations');
  console.log('Model:', model);
  console.log('');

  try {
    const response = await fetch(endpoint + '/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        prompt: 'A beautiful anime character portrait with long black hair',
        response_format: 'url',
        size: '1024x1024',
        guidance_scale: 3,
        watermark: true
      })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('');

    const text = await response.text();
    console.log('Raw Response:');
    console.log(text);
    console.log('');

    if (response.ok) {
      const data = JSON.parse(text);
      console.log('Parsed Response:');
      console.log(JSON.stringify(data, null, 2));

      if (data.data && data.data[0] && data.data[0].url) {
        console.log('\n✅ Success! Image URL:', data.data[0].url);
      }
    } else {
      console.log('❌ Error:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

testBytePlusDirect();
