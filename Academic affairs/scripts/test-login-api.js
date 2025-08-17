// Test the login API directly
const http = require('http');

async function testLogin() {
  console.log('🔐 TESTING LOGIN API');
  console.log('=' .repeat(40));
  
  try {
    const loginData = {
      username: 'teymccall',
      password: 'password123'
    };
    
    console.log('📋 Testing login with:');
    console.log('   Username:', loginData.username);
    console.log('   Password:', loginData.password);
    
    const result = await makeApiCall('/api/auth/login', 'POST', loginData);
    
    console.log('\n📊 API Response:');
    console.log('   Status:', result.status);
    
    if (result.status === 200) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('   User:', result.data.user.name);
      console.log('   Role:', result.data.user.role);
      console.log('   Email:', result.data.user.email);
      console.log('   Session Token:', result.data.user.sessionToken ? 'Generated' : 'Missing');
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('   Error:', result.data.error || result.data);
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

testLogin();














