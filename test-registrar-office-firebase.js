const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  projectId: 'ucaes2025',
  timeout: 10000,
  collections: [
    'users',
    'students',
    'courses',
    'programs',
    'registrations',
    'grades',
    'transcripts',
    'academic-years',
    'system-config',
    'admissions',
    'finance',
    'staff',
    'lecturers'
  ]
};

// Initialize Firebase Admin
function initializeFirebase() {
  try {
    console.log('🔥 Initializing Firebase Admin SDK...');
    
    // Try to read service account
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account file not found at: ${serviceAccountPath}`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    const adminApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: TEST_CONFIG.projectId
    });
    
    const db = getFirestore(adminApp);
    console.log('✅ Firebase Admin initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
}

// Test Firebase connection
async function testFirebaseConnection(db) {
  console.log('\n📡 Testing Firebase connection...');
  
  try {
    // Test basic connection by reading a document
    const testDoc = await db.collection('system-config').doc('test').get();
    console.log('✅ Firebase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error.message);
    return false;
  }
}

// Test collection access
async function testCollections(db) {
  console.log('\n📚 Testing collection access...');
  
  const results = {};
  
  for (const collectionName of TEST_CONFIG.collections) {
    try {
      console.log(`  Testing collection: ${collectionName}`);
      const snapshot = await db.collection(collectionName).limit(1).get();
      results[collectionName] = {
        exists: true,
        count: snapshot.size,
        accessible: true
      };
      console.log(`    ✅ ${collectionName}: ${snapshot.size} documents accessible`);
    } catch (error) {
      results[collectionName] = {
        exists: false,
        count: 0,
        accessible: false,
        error: error.message
      };
      console.log(`    ❌ ${collectionName}: ${error.message}`);
    }
  }
  
  return results;
}

// Test registrar-specific data
async function testRegistrarData(db) {
  console.log('\n👨‍💼 Testing Registrar Office Data...');
  
  const tests = [
    {
      name: 'Staff with registrar role',
      query: () => db.collection('users').where('role', '==', 'registrar').limit(5).get()
    },
    {
      name: 'Student records',
      query: () => db.collection('students').limit(5).get()
    },
    {
      name: 'Course registrations',
      query: () => db.collection('registrations').limit(5).get()
    },
    {
      name: 'Transcripts',
      query: () => db.collection('transcripts').limit(5).get()
    },
    {
      name: 'Academic years',
      query: () => db.collection('academic-years').limit(5).get()
    },
    {
      name: 'System configuration',
      query: () => db.collection('system-config').limit(5).get()
    }
  ];
  
  const results = {};
  
  for (const test of tests) {
    try {
      console.log(`  Testing: ${test.name}`);
      const snapshot = await test.query();
      results[test.name] = {
        success: true,
        count: snapshot.size,
        data: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
      console.log(`    ✅ ${test.name}: ${snapshot.size} records found`);
    } catch (error) {
      results[test.name] = {
        success: false,
        error: error.message
      };
      console.log(`    ❌ ${test.name}: ${error.message}`);
    }
  }
  
  return results;
}

// Test API endpoints
async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...');
  
  const baseUrl = 'http://localhost:3000'; // Adjust if different
  const endpoints = [
    '/api/test',
    '/api/users',
    '/api/students',
    '/api/courses',
    '/api/registrations',
    '/api/transcripts',
    '/api/academic-years',
    '/api/system-config'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    try {
      console.log(`  Testing endpoint: ${endpoint}`);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      results[endpoint] = {
        status: response.status,
        statusText: response.statusText,
        accessible: response.ok
      };
      
      if (response.ok) {
        console.log(`    ✅ ${endpoint}: ${response.status} ${response.statusText}`);
      } else {
        console.log(`    ⚠️ ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      results[endpoint] = {
        error: error.message,
        accessible: false
      };
      console.log(`    ❌ ${endpoint}: ${error.message}`);
    }
  }
  
  return results;
}

// Test registrar office pages
async function testRegistrarPages() {
  console.log('\n📄 Testing Registrar Office Pages...');
  
  const baseUrl = 'http://localhost:3000'; // Adjust if different
  const pages = [
    '/director/dashboard',
    '/director/staff-management',
    '/director/student-management',
    '/director/transcripts',
    '/director/admissions',
    '/director/course-registration',
    '/director/courses',
    '/director/finance',
    '/director/results',
    '/director/lecturer-management',
    '/director/program-management',
    '/director/academic-management',
    '/staff/dashboard',
    '/staff/students',
    '/staff/course-registration',
    '/staff/courses',
    '/staff/transcripts',
    '/staff/admissions',
    '/staff/finance'
  ];
  
  const results = {};
  
  for (const page of pages) {
    try {
      console.log(`  Testing page: ${page}`);
      const response = await fetch(`${baseUrl}${page}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      results[page] = {
        status: response.status,
        statusText: response.statusText,
        accessible: response.ok,
        contentType: response.headers.get('content-type')
      };
      
      if (response.ok) {
        console.log(`    ✅ ${page}: ${response.status} ${response.statusText}`);
      } else {
        console.log(`    ⚠️ ${page}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      results[page] = {
        error: error.message,
        accessible: false
      };
      console.log(`    ❌ ${page}: ${error.message}`);
    }
  }
  
  return results;
}

// Generate test report
function generateReport(firebaseResults, registrarResults, apiResults, pageResults) {
  console.log('\n📊 TEST REPORT');
  console.log('='.repeat(50));
  
  // Firebase Status
  console.log('\n🔥 FIREBASE STATUS:');
  console.log(`Connection: ${firebaseResults.connection ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  console.log('\n📚 Collections Status:');
  const accessibleCollections = Object.values(firebaseResults.collections).filter(c => c.accessible).length;
  const totalCollections = TEST_CONFIG.collections.length;
  console.log(`Accessible: ${accessibleCollections}/${totalCollections}`);
  
  // Registrar Data Status
  console.log('\n👨‍💼 REGISTRAR DATA STATUS:');
  const successfulTests = Object.values(registrarResults).filter(r => r.success).length;
  const totalTests = Object.keys(registrarResults).length;
  console.log(`Successful tests: ${successfulTests}/${totalTests}`);
  
  // API Status
  console.log('\n🌐 API ENDPOINTS STATUS:');
  const accessibleAPIs = Object.values(apiResults).filter(r => r.accessible).length;
  const totalAPIs = Object.keys(apiResults).length;
  console.log(`Accessible APIs: ${accessibleAPIs}/${totalAPIs}`);
  
  // Pages Status
  console.log('\n📄 PAGES STATUS:');
  const accessiblePages = Object.values(pageResults).filter(r => r.accessible).length;
  const totalPages = Object.keys(pageResults).length;
  console.log(`Accessible pages: ${accessiblePages}/${totalPages}`);
  
  // Overall Status
  const overallScore = (accessibleCollections + successfulTests + accessibleAPIs + accessiblePages) / 
                      (totalCollections + totalTests + totalAPIs + totalPages) * 100;
  
  console.log('\n🎯 OVERALL SYSTEM STATUS:');
  console.log(`Score: ${overallScore.toFixed(1)}%`);
  
  if (overallScore >= 90) {
    console.log('Status: 🟢 EXCELLENT - System is fully operational');
  } else if (overallScore >= 75) {
    console.log('Status: 🟡 GOOD - Minor issues detected');
  } else if (overallScore >= 50) {
    console.log('Status: 🟠 FAIR - Several issues need attention');
  } else {
    console.log('Status: 🔴 POOR - Major issues detected');
  }
  
  // Detailed Issues
  console.log('\n🔍 DETAILED ISSUES:');
  
  // Collection issues
  Object.entries(firebaseResults.collections).forEach(([name, result]) => {
    if (!result.accessible) {
      console.log(`❌ Collection "${name}": ${result.error || 'Not accessible'}`);
    }
  });
  
  // Registrar data issues
  Object.entries(registrarResults).forEach(([name, result]) => {
    if (!result.success) {
      console.log(`❌ Registrar data "${name}": ${result.error}`);
    }
  });
  
  // API issues
  Object.entries(apiResults).forEach(([endpoint, result]) => {
    if (!result.accessible) {
      console.log(`❌ API "${endpoint}": ${result.error || `${result.status} ${result.statusText}`}`);
    }
  });
  
  // Page issues
  Object.entries(pageResults).forEach(([page, result]) => {
    if (!result.accessible) {
      console.log(`❌ Page "${page}": ${result.error || `${result.status} ${result.statusText}`}`);
    }
  });
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Registrar Office & Firebase Testing...');
  console.log('='.repeat(60));
  
  try {
    // Initialize Firebase
    const db = initializeFirebase();
    
    // Run tests
    const firebaseConnection = await testFirebaseConnection(db);
    const collections = await testCollections(db);
    const registrarData = await testRegistrarData(db);
    
    // Test API endpoints (if server is running)
    let apiResults = {};
    let pageResults = {};
    
    try {
      apiResults = await testAPIEndpoints();
      pageResults = await testRegistrarPages();
    } catch (error) {
      console.log('⚠️ API/Page tests skipped - server may not be running');
      apiResults = { error: 'Server not running' };
      pageResults = { error: 'Server not running' };
    }
    
    // Generate report
    const firebaseResults = {
      connection: firebaseConnection,
      collections: collections
    };
    
    generateReport(firebaseResults, registrarData, apiResults, pageResults);
    
    console.log('\n✅ Testing completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Testing failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  initializeFirebase,
  testFirebaseConnection,
  testCollections,
  testRegistrarData,
  testAPIEndpoints,
  testRegistrarPages
};