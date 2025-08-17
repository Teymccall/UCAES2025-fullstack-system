// Test multiple user accounts that have passwords
const http = require('http');

const testAccounts = [
  { username: 'teymccall', password: 'password123' },
  { username: 'newdirector', password: 'director2025' },
  { username: 'director2025', password: 'ucaes2025' },
  { username: 'jerry', password: 'director2025' },
  { username: 'mccalll', password: 'director2025' },
  { username: 'adnim', password: 'director2025' }
];

async function testMultipleLogins() {
  console.log('🔐 TESTING MULTIPLE USER ACCOUNTS');
  console.log('=' .repeat(50));
  
  for (const account of testAccounts) {
    try {
      console.log(`\n👤 Testing: ${account.username}`);
      
      const result = await makeApiCall('/api/auth/login', 'POST', account);
      
      if (result.status === 200) {
        console.log(`✅ LOGIN SUCCESS: ${account.username}`);
        console.log(`   Name: ${result.data.user.name}`);
        console.log(`   Email: ${result.data.user.email}`);
      } else {
        console.log(`❌ LOGIN FAILED: ${account.username}`);
        console.log(`   Error: ${result.data.error || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR testing ${account.username}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 WORKING ACCOUNTS SUMMARY:');
  console.log('Try these accounts in your browser:');
  
  for (const account of testAccounts) {
    try {
      const result = await makeApiCall('/api/auth/login', 'POST', account);
      if (result.status === 200) {
        console.log(`✅ Username: ${account.username} | Password: ${account.password}`);
      }
    } catch (error) {
      // Skip failed accounts
    }
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

testMultipleLogins();














