// Test script to verify API endpoints are working after Firebase fix
const http = require('http');

async function testApiEndpoints() {
  console.log('🧪 TESTING FEES PORTAL API ENDPOINTS AFTER FIREBASE FIX');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:3000'; // Adjust if your port is different
  
  // Test 1: GET /api/finance/services
  console.log('\n1️⃣ TESTING GET /api/finance/services...');
  try {
    const servicesResult = await makeApiCall(`${baseUrl}/api/finance/services`, 'GET');
    
    if (servicesResult.status === 200) {
      console.log('✅ GET /api/finance/services: SUCCESS');
      console.log(`   Found ${servicesResult.data.total || 0} services`);
      
      if (servicesResult.data.data && servicesResult.data.data.length > 0) {
        console.log('   First service:', servicesResult.data.data[0].name);
        console.log('   Amount: ¢' + servicesResult.data.data[0].amount);
      }
    } else {
      console.log('❌ GET /api/finance/services: FAILED');
      console.log('   Status:', servicesResult.status);
      console.log('   Error:', servicesResult.data.error || servicesResult.data);
    }
  } catch (error) {
    console.log('❌ GET /api/finance/services: ERROR');
    console.log('   Error:', error.message);
  }
  
  // Test 2: GET /api/finance/services with filters
  console.log('\n2️⃣ TESTING GET /api/finance/services with filters...');
  try {
    const filteredResult = await makeApiCall(
      `${baseUrl}/api/finance/services?category=Academic&type=Service`, 
      'GET'
    );
    
    if (filteredResult.status === 200) {
      console.log('✅ GET /api/finance/services with filters: SUCCESS');
      console.log(`   Found ${filteredResult.data.total || 0} filtered services`);
    } else {
      console.log('❌ GET /api/finance/services with filters: FAILED');
      console.log('   Status:', filteredResult.status);
      console.log('   Error:', filteredResult.data.error || filteredResult.data);
    }
  } catch (error) {
    console.log('❌ GET /api/finance/services with filters: ERROR');
    console.log('   Error:', error.message);
  }
  
  // Test 3: POST /api/finance/service-requests (create test request)
  console.log('\n3️⃣ TESTING POST /api/finance/service-requests...');
  try {
    const testRequest = {
      studentId: 'TEST-001',
      studentName: 'Test Student',
      services: [
        {
          serviceId: 'test-service-1',
          serviceName: 'Test Service',
          quantity: 1,
          amount: 100,
          total: 100
        }
      ],
      notes: 'Test service request from API test script'
    };
    
    const createResult = await makeApiCall(
      `${baseUrl}/api/finance/service-requests`, 
      'POST', 
      testRequest
    );
    
    if (createResult.status === 200) {
      console.log('✅ POST /api/finance/service-requests: SUCCESS');
      console.log('   Created request ID:', createResult.data.data.id);
      console.log('   Status:', createResult.data.data.status);
      
      // Store the ID for cleanup test
      global.testRequestId = createResult.data.data.id;
    } else {
      console.log('❌ POST /api/finance/service-requests: FAILED');
      console.log('   Status:', createResult.status);
      console.log('   Error:', createResult.data.error || createResult.data);
    }
  } catch (error) {
    console.log('❌ POST /api/finance/service-requests: ERROR');
    console.log('   Error:', error.message);
  }
  
  // Test 4: PATCH /api/finance/service-requests/[id] (if we have an ID)
  if (global.testRequestId) {
    console.log('\n4️⃣ TESTING PATCH /api/finance/service-requests/[id]...');
    try {
      const updateData = {
        status: 'approved',
        processedBy: 'Test Script',
        notes: 'Approved by test script'
      };
      
      const updateResult = await makeApiCall(
        `${baseUrl}/api/finance/service-requests/${global.testRequestId}`, 
        'PATCH', 
        updateData
      );
      
      if (updateResult.status === 200) {
        console.log('✅ PATCH /api/finance/service-requests/[id]: SUCCESS');
        console.log('   Updated status to:', updateResult.data.data.status);
      } else {
        console.log('❌ PATCH /api/finance/service-requests/[id]: FAILED');
        console.log('   Status:', updateResult.status);
        console.log('   Error:', updateResult.data.error || updateResult.data);
      }
    } catch (error) {
      console.log('❌ PATCH /api/finance/service-requests/[id]: ERROR');
      console.log('   Error:', error.message);
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 TEST RESULTS SUMMARY:');
  console.log('✅ If all tests passed: API endpoints are working correctly');
  console.log('❌ If any failed: Check the specific error messages above');
  console.log('💡 Make sure your Fees Portal is running on localhost:3000');
  
  if (global.testRequestId) {
    console.log('\n🧹 TEST DATA CREATED:');
    console.log('   Service Request ID:', global.testRequestId);
    console.log('   You can manually delete this from Firebase console if needed');
  }
}

async function makeApiCall(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }
    
    const req = http.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (body && method !== 'GET') {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Run the test
testApiEndpoints();
