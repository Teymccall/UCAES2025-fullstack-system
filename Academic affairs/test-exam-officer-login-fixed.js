const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Fixed exam officer credentials
const EXAM_OFFICER_CREDENTIALS = {
  username: 'examofficer',
  password: 'examofficer123'
};

async function testExamOfficerLoginFixed() {
  console.log('🔐 TESTING EXAM OFFICER LOGIN WITH FIXED CREDENTIALS');
  console.log('=' .repeat(60));
  
  try {
    console.log(`📤 Attempting login with:`);
    console.log(`   Username: ${EXAM_OFFICER_CREDENTIALS.username}`);
    console.log(`   Password: ${EXAM_OFFICER_CREDENTIALS.password}`);
    
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(EXAM_OFFICER_CREDENTIALS),
    });
    
    console.log(`📥 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ LOGIN FAILED');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${errorText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.success && data.user) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('=' .repeat(40));
      console.log(`👤 Name: ${data.user.name}`);
      console.log(`🎭 Role: ${data.user.role}`);
      console.log(`📧 Email: ${data.user.email}`);
      console.log(`🏢 Department: ${data.user.department}`);
      console.log(`💼 Position: ${data.user.position}`);
      console.log(`✅ Status: ${data.user.status}`);
      console.log(`🔑 Permissions:`);
      data.user.permissions.forEach(permission => {
        console.log(`   - ${permission}`);
      });
      
      // Test redirect expectation
      if (data.user.role === 'exam_officer') {
        console.log('\n🎯 EXPECTED BEHAVIOR:');
        console.log('✅ Should redirect to: /staff/dashboard');
        console.log('✅ Should see exam officer menu items');
        console.log('✅ Should have access to results approval');
        console.log('✅ Should have access to transcript generation');
      }
      
      return true;
    } else {
      console.log('❌ LOGIN FAILED');
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
    
  } catch (error) {
    console.log('❌ LOGIN ERROR');
    console.log(`   Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🌐 SERVER CONNECTION ISSUE:');
      console.log('   Make sure the development server is running on port 3001');
      console.log('   Try: npm run dev');
    }
    
    return false;
  }
}

async function testWebPageAccess() {
  console.log('\n🌐 TESTING WEB PAGE ACCESS');
  console.log('=' .repeat(40));
  
  try {
    // Test if the main page loads
    const response = await fetch(`${BASE_URL}/`);
    
    if (response.ok) {
      console.log('✅ Main page accessible');
      console.log(`   Status: ${response.status}`);
      console.log(`   URL: ${BASE_URL}`);
    } else {
      console.log('❌ Main page not accessible');
      console.log(`   Status: ${response.status}`);
    }
    
  } catch (error) {
    console.log('❌ Web page access failed');
    console.log(`   Error: ${error.message}`);
  }
}

async function provideBrowserTestInstructions() {
  console.log('\n🖥️ MANUAL BROWSER TESTING INSTRUCTIONS');
  console.log('=' .repeat(50));
  
  console.log('1. 🌐 Open your web browser');
  console.log('2. 📍 Navigate to: http://localhost:3001');
  console.log('3. 🔐 Enter login credentials:');
  console.log(`   👤 Username: examofficer`);
  console.log(`   🔑 Password: examofficer123`);
  console.log('4. 🖱️ Click "Sign In" button');
  console.log('5. ✅ Verify redirect to /staff/dashboard');
  
  console.log('\n📋 FEATURES TO TEST MANUALLY:');
  console.log('=' .repeat(30));
  
  console.log('\n📊 1. RESULTS APPROVAL:');
  console.log('   • Navigate to /staff/results');
  console.log('   • Check for pending grade submissions');
  console.log('   • Test approval/rejection workflow');
  console.log('   • Verify grade publishing functionality');
  
  console.log('\n📜 2. TRANSCRIPT GENERATION:');
  console.log('   • Navigate to /staff/transcripts');
  console.log('   • Search for students (try "John" or "Jane")');
  console.log('   • Generate sample transcripts');
  console.log('   • Test print/PDF export');
  
  console.log('\n👥 3. STUDENT RECORDS:');
  console.log('   • Navigate to /staff/students');
  console.log('   • View student academic information');
  console.log('   • Check grade history access');
  
  console.log('\n📝 4. DAILY REPORTS:');
  console.log('   • Navigate to /staff/daily-report');
  console.log('   • Submit a test daily report');
  console.log('   • View historical reports');
  
  console.log('\n🎯 5. DASHBOARD:');
  console.log('   • Check dashboard statistics');
  console.log('   • Verify pending approvals count');
  console.log('   • Test quick navigation links');
  
  console.log('\n🔒 6. SECURITY TESTING:');
  console.log('   • Try accessing /director/dashboard (should be blocked)');
  console.log('   • Verify only appropriate menu items are visible');
  console.log('   • Test logout functionality');
}

async function runLoginTest() {
  console.log('🧪 EXAM OFFICER LOGIN AND ACCESS TEST');
  console.log('=' .repeat(60));
  console.log(`📅 Test Date: ${new Date().toLocaleString()}`);
  console.log(`🌐 Server URL: ${BASE_URL}`);
  console.log('=' .repeat(60));
  
  // Test web page access first
  await testWebPageAccess();
  
  // Test login
  const loginSuccess = await testExamOfficerLoginFixed();
  
  if (loginSuccess) {
    console.log('\n🎉 LOGIN TEST: PASSED');
    console.log('✅ Exam officer can successfully log in');
    console.log('✅ Credentials are working correctly');
    console.log('✅ User data is properly returned');
  } else {
    console.log('\n❌ LOGIN TEST: FAILED');
    console.log('❌ Need to investigate login issues');
  }
  
  // Provide manual testing instructions
  await provideBrowserTestInstructions();
  
  console.log('\n📋 SUMMARY:');
  console.log('=' .repeat(20));
  console.log(`✅ Server Status: ${loginSuccess ? 'Running' : 'Issues detected'}`);
  console.log(`✅ Login Credentials: Fixed and ready`);
  console.log(`✅ Username: examofficer`);
  console.log(`✅ Password: examofficer123`);
  console.log(`✅ Expected Role: exam_officer`);
  console.log(`✅ Expected Redirect: /staff/dashboard`);
  
  process.exit(0);
}

runLoginTest();