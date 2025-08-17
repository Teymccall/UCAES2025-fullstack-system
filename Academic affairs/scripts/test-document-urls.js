// Test the updated API to verify document URLs are extracted correctly

async function testDocumentUrls() {
  console.log('🧪 Testing updated API document URL extraction...');
  
  try {
    const response = await fetch('http://localhost:3001/api/admissions/applications');
    const data = await response.json();
    
    if (!data.success) {
      console.error('❌ API request failed:', data.error);
      return;
    }
    
    console.log(`📊 Found ${data.applications.length} applications from API`);
    
    data.applications.forEach((app, index) => {
      console.log(`\n📄 Application ${index + 1}: ${app.firstName} ${app.lastName}`);
      console.log(`   Email: ${app.email}`);
      console.log(`   Status: ${app.status}`);
      
      console.log('\n   📁 Document URLs:');
      if (app.documentUrls) {
        Object.entries(app.documentUrls).forEach(([key, url]) => {
          if (url && url.trim() !== '') {
            console.log(`      ✅ ${key}: ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
          } else {
            console.log(`      ❌ ${key}: Not available`);
          }
        });
      } else {
        console.log('      ❌ No documentUrls field');
      }
      
      console.log('\n   ═══════════════════════════════════════');
    });
    
    console.log('\n🎉 API test completed successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testDocumentUrls()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Document URL extraction is working!');
      console.log('🎯 The director should now be able to view documents.');
    } else {
      console.log('\n❌ Test failed!');
      console.log(`🚨 Error: ${result.error}`);
    }
  })
  .catch(error => {
    console.error('💥 Unexpected error:', error);
  });


