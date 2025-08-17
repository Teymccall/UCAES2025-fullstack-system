// Test that mccall123 account now works with the UID fix
const http = require('http');

async function testMccall123Fixed() {
  console.log('🔐 TESTING MCCALL123 WITH UID FIX');
  console.log('=' .repeat(45));
  
  try {
    const loginData = {
      username: 'mccall123',
      password: 'test123456'  // The password from when you created the account
    };
    
    console.log('📋 Testing login:');
    console.log('   Username:', loginData.username);
    
    const result = await makeApiCall('/api/auth/login', 'POST', loginData);
    
    console.log('\n📊 API Response:');
    console.log('   Status:', result.status);
    
    if (result.status === 200) {
      console.log('🎉 LOGIN SUCCESS!');
      console.log('   User:', result.data.user.name);
      console.log('   Email:', result.data.user.email);
      console.log('   Role:', result.data.user.role);
      console.log('   UID returned:', result.data.user.uid);
      
      console.log('\n✅ ACCOUNT SHOULD NOW WORK IN BROWSER!');
      console.log('🎯 Login credentials:');
      console.log('   Username: mccall123');
      console.log('   Password: test123456');
      console.log('\n   Go to: http://localhost:3000/login');
      console.log('   You should NOT get "Account Suspended" anymore!');
      
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('   Error:', result.data.error || result.data);
      
      if (result.data.error === 'Invalid username or password.') {
        console.log('\n💡 The password might be different. Try these:');
        const passwords = ['test123456', 'mccall123', 'password123', 'director2025'];
        
        for (const pwd of passwords) {
          try {
            const testResult = await makeApiCall('/api/auth/login', 'POST', {
              username: 'mccall123',
              password: pwd
            });
            
            if (testResult.status === 200) {
              console.log(`   ✅ CORRECT PASSWORD: ${pwd}`);
              console.log(`   User: ${testResult.data.user.name}`);
              break;
            }
          } catch (e) {
            // Continue testing
          }
        }
      }
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

testMccall123Fixed();














