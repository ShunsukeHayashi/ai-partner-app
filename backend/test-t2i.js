// Quick test script to check BytePlus T2I API
async function testT2I() {
  const response = await fetch('http://localhost:3001/api/test/t2i', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token'
    },
    body: JSON.stringify({
      prompt: 'A beautiful anime character portrait',
      size: '1024x1024'
    })
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Response:', JSON.stringify(data, null, 2));
}

testT2I().catch(console.error);
