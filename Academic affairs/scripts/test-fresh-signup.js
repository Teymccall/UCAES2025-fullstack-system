// Test creating a completely fresh account and then logging in
const http = require('http');

async function testFreshSignupAndLogin() {
  console.log('🆕 TESTING FRESH SIGNUP AND LOGIN');
  console.log('=' .repeat(50));
  
  try {
    // Create a unique account
    const timestamp = Date.now();
    const signupData = {
      username: `testuser${timestamp}`,
      name: 'Test User Fresh',
      email: `testuser${timestamp}@ucaes.edu.gh`,
      password: 'test123456',
      role: 'director'
    };
    
    console.log('📝 STEP 1: Creating new account...');
    console.log('   Username:', signupData.username);
    console.log('   Name:', signupData.name);
    console.log('   Email:', signupData.email);
    console.log('   Password:', signupData.password);
    
    // Test signup
    const signupResult = await makeApiCall('/api/auth/signup', 'POST', signupData);
    
    console.log('\n📊 Signup Response:');
    console.log('   Status:', signupResult.status);
    
    if (signupResult.status !== 200) {
      console.log('❌ SIGNUP FAILED');
      console.log('   Error:', signupResult.data.error || signupResult.data);
      return;
    }
    
    console.log('✅ SIGNUP SUCCESS!');
    console.log('   User created:', signupResult.data.user.name);
    
    // Wait a moment then test login
    console.log('\n⏳ Waiting 2 seconds before testing login...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔐 STEP 2: Testing login with new account...');
    
    const loginData = {
      username: signupData.username,
      password: signupData.password
    };
    
    const loginResult = await makeApiCall('/api/auth/login', 'POST', loginData);
    
    console.log('\n📊 Login Response:');
    console.log('   Status:', loginResult.status);
    
    if (loginResult.status === 200) {
      console.log('🎉 LOGIN SUCCESS WITH NEW ACCOUNT!');
      console.log('   User:', loginResult.data.user.name);
      console.log('   Email:', loginResult.data.user.email);
      console.log('   Role:', loginResult.data.user.role);
      
      console.log('\n✅ BOTH SIGNUP AND LOGIN WORKING!');
      console.log('🎯 Your new account credentials:');
      console.log(`   Username: ${signupData.username}`);
      console.log(`   Password: ${signupData.password}`);
      console.log('\nYou can use this account to login in your browser!');
      
    } else {
      console.log('❌ LOGIN FAILED WITH NEW ACCOUNT');
      console.log('   Error:', loginResult.data.error || loginResult.data);
      
      console.log('\n🔍 This suggests there might be an issue with:');
      console.log('1. Password hashing during signup');
      console.log('2. Password verification during login');
      console.log('3. Data storage format');
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

testFreshSignupAndLogin();














