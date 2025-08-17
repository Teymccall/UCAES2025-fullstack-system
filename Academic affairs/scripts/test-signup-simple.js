// Simple test to check if signup API exists
const http = require('http');

async function testSignupEndpoint() {
  console.log('🔍 TESTING SIGNUP ENDPOINT');
  console.log('=' .repeat(40));
  
  try {
    // First test if the endpoint exists
    const result = await makeApiCall('/api/auth/signup', 'GET');
    
    console.log('📊 GET Response:');
    console.log('   Status:', result.status);
    console.log('   Data:', result.data);
    
    // Then test POST with minimal data
    const signupData = {
      username: 'testuser',
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123'
    };
    
    const postResult = await makeApiCall('/api/auth/signup', 'POST', signupData);
    
    console.log('\n📊 POST Response:');
    console.log('   Status:', postResult.status);
    console.log('   Data:', postResult.data);
    
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

testSignupEndpoint();














