// Debug script to test the admission letter API
console.log('🔍 Testing admission letter API...');

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/admissions/generate-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: 'UCAES202500001'
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response body:', errorText);
      return;
    }

    console.log('✅ Success! Response headers:', Object.fromEntries(response.headers.entries()));
    
  } catch (error) {
    console.log('💥 Network error:', error.message);
  }
}

testAPI();




























