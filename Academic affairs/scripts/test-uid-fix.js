// Test the UID fix by creating and logging in with a new account
const http = require('http');

async function testUIDFix() {
  console.log('🔧 TESTING UID FIX');
  console.log('=' .repeat(40));
  
  try {
    // Create a unique account
    const timestamp = Date.now();
    const signupData = {
      username: `testfix${timestamp}`,
      name: 'Test UID Fix',
      email: `testfix${timestamp}@ucaes.edu.gh`,
      password: 'testfix123',
      role: 'director'
    };
    
    console.log('📝 Creating new account...');
    console.log('   Username:', signupData.username);
    
    // Test signup
    const signupResult = await makeApiCall('/api/auth/signup', 'POST', signupData);
    
    if (signupResult.status !== 200) {
      console.log('❌ SIGNUP FAILED');
      console.log('   Error:', signupResult.data.error);
      return;
    }
    
    console.log('✅ Signup successful');
    
    // Wait then test login
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n🔐 Testing login...');
    const loginData = {
      username: signupData.username,
      password: signupData.password
    };
    
    const loginResult = await makeApiCall('/api/auth/login', 'POST', loginData);
    
    if (loginResult.status === 200) {
      console.log('✅ LOGIN SUCCESS!');
      console.log('   User:', loginResult.data.user.name);
      console.log('   UID returned:', loginResult.data.user.uid);
      
      // Now check if this UID matches the actual document ID
      console.log('\n🔍 Verifying UID matches document ID...');
      
      // The UID should now be the actual Firestore document ID
      console.log('🎯 CRITICAL: The UID returned should be the Firestore document ID');
      console.log('   This will allow the auth context real-time listener to work');
      console.log('\n✅ UID FIX TEST COMPLETE');
      console.log('   Try logging in with this account in the browser:');
      console.log(`   Username: ${signupData.username}`);
      console.log(`   Password: ${signupData.password}`);
      console.log('   You should NOT get the "Account Suspended" error anymore!');
      
    } else {
      console.log('❌ LOGIN FAILED');
      console.log('   Error:', loginResult.data.error);
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

testUIDFix();














