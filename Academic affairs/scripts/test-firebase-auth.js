// Test Firebase connection in auth context
const http = require('http');

async function testFirebaseAuth() {
  console.log('🔥 TESTING FIREBASE CONNECTION IN AUTH');
  console.log('=' .repeat(45));
  
  try {
    const result = await makeApiCall('/api/auth/test-firebase');
    
    console.log('📊 API Response:');
    console.log('   Status:', result.status);
    console.log('   Data:', result.data);
    
    if (result.status === 200) {
      console.log('✅ Firebase connection working!');
    } else {
      console.log('❌ Firebase connection failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function makeApiCall(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

testFirebaseAuth();














