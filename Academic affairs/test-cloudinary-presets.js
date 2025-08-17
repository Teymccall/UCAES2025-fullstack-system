const fetch = require('node-fetch');

async function testCloudinaryPresets() {
  console.log('🔍 Testing Cloudinary Upload Presets...');
  console.log('');
  
  const CLOUDINARY_CLOUD_NAME = 'dxkkv9nbn';
  const presets = ['studentspassport', 'UCAES2025'];
  
  for (const preset of presets) {
    console.log(`📤 Testing preset: ${preset}`);
    
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Create a minimal test file
      const testBuffer = Buffer.from('test image data');
      formData.append('file', testBuffer, {
        filename: 'test.txt',
        contentType: 'text/plain'
      });
      formData.append('upload_preset', preset);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.text();
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        console.log(`   ✅ Preset '${preset}' is valid and working`);
      } else {
        console.log(`   ❌ Preset '${preset}' failed:`);
        console.log(`      ${result.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`   ❌ Error testing '${preset}': ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🎯 RECOMMENDATION:');
  console.log('   Use the working preset in your cloudinary-service.ts file');
}

testCloudinaryPresets();




























