// Test creating a real director account
const http = require('http');

async function testDirectorSignup() {
  console.log('👤 TESTING DIRECTOR SIGNUP');
  console.log('=' .repeat(40));
  
  try {
    const signupData = {
      username: 'newdirector',
      name: 'New Academic Director',
      email: 'newdirector@ucaes.edu.gh',
      password: 'director2025',
      role: 'director'
    };
    
    console.log('📋 Creating director account:');
    console.log('   Username:', signupData.username);
    console.log('   Name:', signupData.name);
    console.log('   Email:', signupData.email);
    console.log('   Role:', signupData.role);
    
    const result = await makeApiCall('/api/auth/signup', 'POST', signupData);
    
    console.log('\n📊 API Response:');
    console.log('   Status:', result.status);
    
    if (result.status === 200) {
      console.log('🎉 DIRECTOR ACCOUNT CREATED SUCCESSFULLY!');
      console.log('   User:', result.data.user.name);
      console.log('   Username:', result.data.user.username);
      console.log('   Email:', result.data.user.email);
      console.log('   Role:', result.data.user.role);
      
      console.log('\n🎯 LOGIN CREDENTIALS:');
      console.log('   Username: newdirector');
      console.log('   Password: director2025');
      console.log('\nYou can now login to Academic Affairs with these credentials!');
      
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

testDirectorSignup();














