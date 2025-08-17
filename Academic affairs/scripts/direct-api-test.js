// Test the API directly to see server-side logs
const http = require('http');

async function testApiDirectly() {
  console.log('🔥 TESTING API DIRECTLY');
  console.log('This will trigger server-side logs we can see');
  console.log('=' .repeat(50));

  try {
    // Test the Firebase debug endpoint
    console.log('📊 Testing Firebase connection from API...');
    const debugResult = await makeApiCall('/api/debug/firebase-test');
    
    console.log(`Status: ${debugResult.status}`);
    if (debugResult.status === 200) {
      const data = debugResult.data;
      console.log(`Firebase Connected: ${data.firebaseConnected}`);
      console.log(`Collections found:`);
      
      Object.entries(data.collections).forEach(([name, info]) => {
        if (info.error) {
          console.log(`  ❌ ${name}: ERROR - ${info.error}`);
        } else {
          console.log(`  ✅ ${name}: ${info.count} documents`);
          if (info.sampleData && info.sampleData.length > 0) {
            console.log(`     Sample students:`);
            info.sampleData.forEach((student, index) => {
              console.log(`     ${index + 1}. ${student.name} (${student.registrationNumber})`);
            });
          }
        }
      });
      
      if (data.error) {
        console.log(`❌ Error: ${data.error}`);
      }
    } else {
      console.log(`❌ API call failed: ${debugResult.data}`);
    }

    console.log('\n📋 Testing student search API...');
    const searchResult = await makeApiCall('/api/director/transcripts', 'POST', { searchTerm: 'PEASE' });
    
    console.log(`Search Status: ${searchResult.status}`);
    if (searchResult.status === 200) {
      console.log(`Students found: ${searchResult.data.length}`);
      searchResult.data.forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.name} (${student.registrationNumber})`);
      });
    } else {
      console.log(`❌ Search failed: ${searchResult.data}`);
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

testApiDirectly();














