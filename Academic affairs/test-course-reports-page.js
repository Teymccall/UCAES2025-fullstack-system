const fetch = require('node-fetch');

async function testCourseReportsPage() {
  console.log('🧪 TESTING COURSE REPORTS PAGE ACCESS');
  console.log('=' .repeat(50));
  
  try {
    // Test if the page is accessible
    const response = await fetch('http://localhost:3001/staff/results/reports');
    
    console.log(`📥 Response Status: ${response.status}`);
    console.log(`📄 Content Type: ${response.headers.get('content-type')}`);
    
    if (response.ok) {
      console.log('✅ Course Reports page is accessible');
      
      // Check if it's returning HTML (not JSON error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log('✅ Page returns HTML content');
      } else {
        console.log('⚠️ Page might be returning non-HTML content');
      }
    } else {
      console.log('❌ Course Reports page is not accessible');
      const errorText = await response.text();
      console.log(`Error: ${errorText.substring(0, 200)}...`);
    }
    
  } catch (error) {
    console.log('❌ Error accessing Course Reports page');
    console.log(`Error: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🌐 SERVER CONNECTION ISSUE:');
      console.log('   Make sure the development server is running on port 3001');
      console.log('   Try: npm run dev');
    }
  }
  
  console.log('\n📋 TROUBLESHOOTING STEPS:');
  console.log('1. Ensure development server is running: npm run dev');
  console.log('2. Login as exam officer: examofficer / examofficer123');
  console.log('3. Look for "Results • Course Report" in the sidebar menu');
  console.log('4. Click on it to navigate to /staff/results/reports');
  console.log('5. Check browser console for any JavaScript errors');
  
  process.exit(0);
}

testCourseReportsPage();