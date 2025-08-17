// Test login for the newly created director account
const http = require('http');

async function testNewDirectorLogin() {
  console.log('🔐 TESTING NEW DIRECTOR LOGIN');
  console.log('=' .repeat(45));
  
  try {
    const loginData = {
      username: 'newdirector',
      password: 'director2025'
    };
    
    console.log('📋 Testing login with NEW director account:');
    console.log('   Username:', loginData.username);
    console.log('   Password:', loginData.password);
    
    const result = await makeApiCall('/api/auth/login', 'POST', loginData);
    
    console.log('\n📊 API Response:');
    console.log('   Status:', result.status);
    
    if (result.status === 200) {
      console.log('🎉 NEW DIRECTOR LOGIN SUCCESSFUL!');
      console.log('   User:', result.data.user.name);
      console.log('   Role:', result.data.user.role);
      console.log('   Email:', result.data.user.email);
      console.log('   Username:', result.data.user.username);
      console.log('   Department:', result.data.user.department);
      console.log('   Permissions:', result.data.user.permissions?.length || 0, 'permissions');
      console.log('   Session Token:', result.data.user.sessionToken ? 'Generated ✅' : 'Missing ❌');
      
      console.log('\n🎯 SIGNUP & LOGIN WORKING!');
      console.log('✅ You can now create new director accounts');
      console.log('✅ New accounts can login successfully');
      console.log('✅ Full access to transcript system');
      
    } else {
      console.log('❌ NEW DIRECTOR LOGIN FAILED');
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

testNewDirectorLogin();
