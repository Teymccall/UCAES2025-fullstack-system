const fetch = require('node-fetch');

async function testAdmissionLetterAPI() {
  try {
    console.log('🧪 Testing admission letter API...');
    
    const response = await fetch('http://localhost:3000/api/admissions/generate-letter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        applicationId: 'UCAES202500001' // Getty's application ID
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      console.log('✅ PDF response received');
      const buffer = await response.buffer();
      console.log('📄 PDF size:', buffer.length, 'bytes');
    } else {
      const text = await response.text();
      console.log('📄 Response body:', text);
    }

  } catch (error) {
    console.error('💥 Network error:', error.message);
  }
}

testAdmissionLetterAPI();




























