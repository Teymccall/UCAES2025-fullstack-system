// Test if the login page is accessible
const http = require('http');

async function testLoginPage() {
  console.log('🌐 TESTING LOGIN PAGE ACCESS');
  console.log('=' .repeat(40));
  
  try {
    // Test main page
    const mainResult = await makeApiCall('/', 'GET');
    console.log('📊 Main page (/):', mainResult.status);
    
    // Test login page
    const loginResult = await makeApiCall('/login', 'GET');
    console.log('📊 Login page (/login):', loginResult.status);
    
    if (mainResult.status === 200 || loginResult.status === 200) {
      console.log('\n✅ ACADEMIC AFFAIRS SERVER IS RUNNING!');
      console.log('🌐 Access the login page at:');
      console.log('   http://localhost:3000/login');
      console.log('   OR');
      console.log('   http://localhost:3000/');
      
      console.log('\n🔐 LOGIN CREDENTIALS:');
      console.log('   Username: teymccall');
      console.log('   Password: password123');
      console.log('   OR');
      console.log('   Username: newdirector');
      console.log('   Password: director2025');
      
      console.log('\n📝 SIGNUP PAGE:');
      console.log('   http://localhost:3000/login/signup');
      
    } else {
      console.log('\n❌ SERVER NOT ACCESSIBLE');
      console.log('Main page status:', mainResult.status);
      console.log('Login page status:', loginResult.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Make sure you ran "npm run dev" in Academic affairs folder');
    console.log('2. Wait for server to fully start (may take 30-60 seconds)');
    console.log('3. Check if port 3000 is available');
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
        'Content-Type': 'text/html'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

testLoginPage();














