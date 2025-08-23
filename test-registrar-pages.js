// Test Registrar Office Pages Structure
const fs = require('fs');
const path = require('path');

console.log('📄 Testing Registrar Office Pages Structure...');
console.log('='.repeat(50));

// Define registrar office pages to check
const registrarPages = [
  // Director pages (accessible by registrar)
  'app/director/dashboard/page.tsx',
  'app/director/staff-management/page.tsx',
  'app/director/student-management/page.tsx',
  'app/director/transcripts/page.tsx',
  'app/director/admissions/page.tsx',
  'app/director/course-registration/page.tsx',
  'app/director/courses/page.tsx',
  'app/director/finance/page.tsx',
  'app/director/results/page.tsx',
  'app/director/lecturer-management/page.tsx',
  'app/director/program-management/page.tsx',
  'app/director/academic-management/page.tsx',
  
  // Staff pages (accessible by registrar)
  'app/staff/dashboard/page.tsx',
  'app/staff/students/page.tsx',
  'app/staff/course-registration/page.tsx',
  'app/staff/courses/page.tsx',
  'app/staff/transcripts/page.tsx',
  'app/staff/admissions/page.tsx',
  'app/staff/finance/page.tsx',
  
  // API routes
  'app/api/test/route.ts',
  'app/api/users/route.ts',
  'app/api/students/route.ts',
  'app/api/courses/route.ts',
  'app/api/registrations/route.ts',
  'app/api/transcripts/route.ts',
  'app/api/academic-years/route.ts',
  'app/api/system-config/route.ts',
  
  // Components
  'components/sidebar.tsx',
  'components/route-guard.tsx',
  'lib/firebase.ts',
  'lib/firebase-admin.ts',
  'lib/firebase-service.ts'
];

// Test page existence and basic structure
function testPages() {
  console.log('\n📁 Testing Page Files:');
  
  const results = {
    exists: [],
    missing: [],
    errors: []
  };
  
  for (const pagePath of registrarPages) {
    try {
      const fullPath = path.join(process.cwd(), pagePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        results.exists.push({
          path: pagePath,
          size: stats.size,
          hasContent: content.length > 0,
          hasReact: content.includes('React') || content.includes('export default'),
          hasFirebase: content.includes('firebase') || content.includes('Firebase')
        });
        
        console.log(`  ✅ ${pagePath} (${stats.size} bytes)`);
      } else {
        results.missing.push(pagePath);
        console.log(`  ❌ ${pagePath} (missing)`);
      }
    } catch (error) {
      results.errors.push({ path: pagePath, error: error.message });
      console.log(`  ⚠️ ${pagePath} (error: ${error.message})`);
    }
  }
  
  return results;
}

// Test Firebase configuration
function testFirebaseConfig() {
  console.log('\n🔥 Testing Firebase Configuration:');
  
  const firebaseFiles = [
    'lib/firebase.ts',
    'lib/firebase-admin.ts',
    'lib/firebase-service.ts',
    'firebase.json',
    'firestore.rules',
    'firestore.indexes.json'
  ];
  
  const results = {
    client: false,
    admin: false,
    service: false,
    config: false,
    rules: false,
    indexes: false
  };
  
  for (const file of firebaseFiles) {
    try {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        if (file.includes('firebase.ts') && !file.includes('admin')) {
          results.client = content.includes('initializeApp') && content.includes('getFirestore');
        } else if (file.includes('firebase-admin.ts')) {
          results.admin = content.includes('firebase-admin') && content.includes('initializeApp');
        } else if (file.includes('firebase-service.ts')) {
          results.service = content.includes('firebase') && content.length > 100;
        } else if (file.includes('firebase.json')) {
          results.config = content.includes('firestore') || content.includes('database');
        } else if (file.includes('firestore.rules')) {
          results.rules = content.includes('rules_version') || content.includes('match');
        } else if (file.includes('firestore.indexes.json')) {
          results.indexes = content.includes('indexes') || content.includes('collectionGroup');
        }
        
        console.log(`  ✅ ${file}`);
      } else {
        console.log(`  ❌ ${file} (missing)`);
      }
    } catch (error) {
      console.log(`  ⚠️ ${file} (error: ${error.message})`);
    }
  }
  
  return results;
}

// Test registrar-specific components
function testRegistrarComponents() {
  console.log('\n👨‍💼 Testing Registrar Components:');
  
  const components = [
    'components/sidebar.tsx',
    'components/route-guard.tsx'
  ];
  
  const results = {};
  
  for (const component of components) {
    try {
      const fullPath = path.join(process.cwd(), component);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        results[component] = {
          exists: true,
          hasRegistrar: content.includes('registrar'),
          hasRoleCheck: content.includes('role') && content.includes('registrar'),
          hasPermissions: content.includes('permissions') || content.includes('auth')
        };
        
        console.log(`  ✅ ${component} (registrar support: ${results[component].hasRegistrar})`);
      } else {
        results[component] = { exists: false };
        console.log(`  ❌ ${component} (missing)`);
      }
    } catch (error) {
      results[component] = { exists: false, error: error.message };
      console.log(`  ⚠️ ${component} (error: ${error.message})`);
    }
  }
  
  return results;
}

// Generate summary report
function generateSummary(pageResults, firebaseResults, componentResults) {
  console.log('\n📊 SUMMARY REPORT:');
  console.log('='.repeat(40));
  
  // Page summary
  console.log('\n📄 Pages:');
  console.log(`  Total pages: ${registrarPages.length}`);
  console.log(`  Existing: ${pageResults.exists.length}`);
  console.log(`  Missing: ${pageResults.missing.length}`);
  console.log(`  Errors: ${pageResults.errors.length}`);
  
  // Firebase summary
  console.log('\n🔥 Firebase Configuration:');
  const firebaseWorking = Object.values(firebaseResults).filter(Boolean).length;
  const firebaseTotal = Object.keys(firebaseResults).length;
  console.log(`  Working: ${firebaseWorking}/${firebaseTotal}`);
  
  // Component summary
  console.log('\n👨‍💼 Registrar Components:');
  const componentWorking = Object.values(componentResults).filter(c => c.exists).length;
  const componentTotal = Object.keys(componentResults).length;
  console.log(`  Working: ${componentWorking}/${componentTotal}`);
  
  // Overall score
  const pageScore = pageResults.exists.length / registrarPages.length * 100;
  const firebaseScore = firebaseWorking / firebaseTotal * 100;
  const componentScore = componentWorking / componentTotal * 100;
  const overallScore = (pageScore + firebaseScore + componentScore) / 3;
  
  console.log('\n🎯 Overall Score:');
  console.log(`  Pages: ${pageScore.toFixed(1)}%`);
  console.log(`  Firebase: ${firebaseScore.toFixed(1)}%`);
  console.log(`  Components: ${componentScore.toFixed(1)}%`);
  console.log(`  Overall: ${overallScore.toFixed(1)}%`);
  
  if (overallScore >= 90) {
    console.log('Status: 🟢 EXCELLENT - All registrar office pages are properly structured');
  } else if (overallScore >= 75) {
    console.log('Status: 🟡 GOOD - Most registrar office pages are available');
  } else if (overallScore >= 50) {
    console.log('Status: 🟠 FAIR - Some registrar office pages need attention');
  } else {
    console.log('Status: 🔴 POOR - Many registrar office pages are missing');
  }
  
  // Missing critical files
  if (pageResults.missing.length > 0) {
    console.log('\n❌ Missing Critical Files:');
    pageResults.missing.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
  // Firebase issues
  const firebaseIssues = Object.entries(firebaseResults).filter(([key, value]) => !value);
  if (firebaseIssues.length > 0) {
    console.log('\n❌ Firebase Issues:');
    firebaseIssues.forEach(([key, value]) => {
      console.log(`  - ${key}: Not properly configured`);
    });
  }
}

// Run all tests
function runTests() {
  const pageResults = testPages();
  const firebaseResults = testFirebaseConfig();
  const componentResults = testRegistrarComponents();
  
  generateSummary(pageResults, firebaseResults, componentResults);
  
  console.log('\n✅ Page structure testing completed!');
}

runTests();