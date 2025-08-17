// Test the signup API directly
const http = require('http');

async function testSignup() {
  console.log('🔐 TESTING SIGNUP API');
  console.log('=' .repeat(40));
  
  try {
    const signupData = {
      username: 'testdirector',
      name: 'Test Director',
      email: 'testdirector@ucaes.edu.gh',
      password: 'test123',
      role: 'director'
    };
    
    console.log('📋 Testing signup with:');
    console.log('   Username:', signupData.username);
    console.log('   Name:', signupData.name);
    console.log('   Email:', signupData.email);
    console.log('   Role:', signupData.role);
    
    const result = await makeApiCall('/api/auth/signup', 'POST', signupData);
    
    console.log('\n📊 API Response:');
    console.log('   Status:', result.status);
    console.log('   Data:', result.data);
    
    if (result.status === 200) {
      console.log('✅ SIGNUP SUCCESSFUL!');
      console.log('   User created:', result.data.user.name);
      console.log('   Username:', result.data.user.username);
      console.log('   Email:', result.data.user.email);
    } else {
      console.log('❌ SIGNUP FAILED');
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

testSignup();














