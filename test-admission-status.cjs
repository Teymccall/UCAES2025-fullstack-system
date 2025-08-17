const fetch = require('node-fetch');

async function testAdmissionStatusUpdate() {
  try {
    console.log('🧪 Testing Open Admissions API call...');
    
    const response = await fetch('http://localhost:3000/api/admissions/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        year: '2026-2027',  // Current year from your screenshot
        status: 'open',
        userId: 'director'
      }),
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    const data = await response.json();
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ SUCCESS: Admission status updated to OPEN');
    } else {
      console.log('❌ FAILED:', data.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testAdmissionStatusUpdate();

