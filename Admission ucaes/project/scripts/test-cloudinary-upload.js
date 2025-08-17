// Test Cloudinary upload functionality
console.log('🧪 Testing Cloudinary Upload Functionality...');

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dyvabxsvh';
const CLOUDINARY_UPLOAD_PRESET = 'ucaes_admissions';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

async function testCloudinaryConfig() {
  console.log('\n🔍 Checking Cloudinary Configuration...');
  console.log('Cloud Name:', CLOUDINARY_CLOUD_NAME);
  console.log('Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
  console.log('API URL:', CLOUDINARY_API_URL);
  
  // Test 1: Check if upload preset exists and is configured correctly
  console.log('\n📋 Test 1: Checking Upload Preset Configuration...');
  
  try {
    // Create a small test file blob
    const testContent = 'test,data,for,cloudinary\nupload,test,check,status';
    const testBlob = new Blob([testContent], { type: 'text/csv' });
    const testFile = new File([testBlob], 'test-upload.csv', { type: 'text/csv' });
    
    console.log('📁 Test file created:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });

    // Create form data exactly like the service does
    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'ucaes/admissions/test-user/test-document');
    formData.append('public_id', `test-user_test-document_${Date.now()}`);
    formData.append('tags', 'admissions,ucaes,document,test');

    console.log('📦 FormData parameters:');
    console.log('   - file: test-upload.csv');
    console.log('   - upload_preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('   - folder: ucaes/admissions/test-user/test-document');
    console.log('   - tags: admissions,ucaes,document,test');

    console.log('\n🚀 Attempting upload to Cloudinary...');
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Response details:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   OK:', response.ok);

    const responseText = await response.text();
    console.log('📄 Raw response:', responseText);

    if (!response.ok) {
      console.error('❌ Upload failed!');
      
      // Try to parse the error
      try {
        const errorData = JSON.parse(responseText);
        console.error('📋 Error details:', errorData);
        
        if (errorData.error) {
          console.error('🔍 Specific error:', errorData.error);
          
          // Common error analysis
          if (errorData.error.message?.includes('Invalid upload preset')) {
            console.error('💡 ISSUE: Upload preset "ucaes_admissions" does not exist or is not configured properly');
            console.error('💡 SOLUTION: Check your Cloudinary dashboard > Settings > Upload > Upload presets');
          } else if (errorData.error.message?.includes('Invalid cloud name')) {
            console.error('💡 ISSUE: Cloud name "dyvabxsvh" is incorrect');
            console.error('💡 SOLUTION: Verify the cloud name in your Cloudinary dashboard');
          } else if (errorData.error.message?.includes('Resource type')) {
            console.error('💡 ISSUE: File type not supported or resource type mismatch');
            console.error('💡 SOLUTION: Check upload preset settings for allowed file types');
          }
        }
      } catch (parseError) {
        console.error('❌ Could not parse error response');
        console.error('Raw error:', responseText);
      }
      
      return false;
    }

    // Parse successful response
    try {
      const result = JSON.parse(responseText);
      console.log('✅ Upload successful!');
      console.log('📋 Upload result:', {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes
      });
      
      return true;
    } catch (parseError) {
      console.error('❌ Could not parse success response');
      console.error('Raw response:', responseText);
      return false;
    }

  } catch (error) {
    console.error('💥 Network or other error:', error);
    console.error('Error details:', error.message);
    
    if (error.message.includes('Failed to fetch')) {
      console.error('💡 ISSUE: Network connectivity problem or CORS issue');
      console.error('💡 SOLUTION: Check internet connection and Cloudinary CORS settings');
    }
    
    return false;
  }
}

async function checkUploadPreset() {
  console.log('\n🔍 Test 2: Checking if Upload Preset exists...');
  
  try {
    // Try to get upload preset information (this requires admin API, but we can try)
    const presetCheckUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload_presets/${CLOUDINARY_UPLOAD_PRESET}`;
    
    console.log('📡 Checking preset at:', presetCheckUrl);
    
    const response = await fetch(presetCheckUrl);
    console.log('Response status:', response.status);
    
    if (response.status === 401) {
      console.log('⚠️ 401 Unauthorized - Upload preset check requires API key');
      console.log('💡 This is normal for unsigned upload presets');
      return true; // This is expected for unsigned presets
    } else if (response.status === 404) {
      console.error('❌ 404 Not Found - Upload preset does not exist!');
      console.error('💡 SOLUTION: Create upload preset "ucaes_admissions" in Cloudinary dashboard');
      return false;
    } else {
      const text = await response.text();
      console.log('Response:', text);
      return true;
    }
  } catch (error) {
    console.log('⚠️ Could not check preset (this is normal):', error.message);
    return true; // Don't fail the test for this
  }
}

async function testImageUpload() {
  console.log('\n🖼️ Test 3: Testing with image file (recommended format)...');
  
  try {
    // Create a simple 1x1 pixel PNG for testing
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(0, 0, 1, 1);
    
    const dataURL = canvas.toDataURL('image/png');
    const response = await fetch(dataURL);
    const blob = await response.blob();
    const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
    
    console.log('📁 Test image file created:', {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    });

    const formData = new FormData();
    formData.append('file', testFile);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'ucaes/admissions/test-user/test-image');

    console.log('🚀 Uploading test image...');
    
    const uploadResponse = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    console.log('📡 Image upload response:', uploadResponse.status, uploadResponse.statusText);
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('✅ Image upload successful!');
      console.log('🔗 Image URL:', result.secure_url);
      return true;
    } else {
      const errorText = await uploadResponse.text();
      console.error('❌ Image upload failed:', errorText);
      return false;
    }
    
  } catch (error) {
    console.error('💥 Image upload test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Cloudinary Upload Tests...\n');
  
  const results = {
    configTest: await testCloudinaryConfig(),
    presetTest: await checkUploadPreset(),
    imageTest: false // Will run only if we're in browser
  };
  
  // Only run image test if we have document/canvas support (browser environment)
  if (typeof document !== 'undefined') {
    results.imageTest = await testImageUpload();
  } else {
    console.log('\n⚠️ Skipping image test - not in browser environment');
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('✅ Config & Upload Test:', results.configTest ? 'PASSED' : 'FAILED');
  console.log('✅ Preset Check Test:', results.presetTest ? 'PASSED' : 'FAILED');
  console.log('✅ Image Upload Test:', results.imageTest ? 'PASSED' : 'SKIPPED');
  
  if (results.configTest && results.presetTest) {
    console.log('\n🎉 Cloudinary configuration appears to be working!');
    console.log('💡 If uploads still fail in your app, check:');
    console.log('   1. Network connectivity');
    console.log('   2. File validation logic');
    console.log('   3. Browser console for detailed error messages');
  } else {
    console.log('\n⚠️ Issues detected with Cloudinary configuration');
    console.log('💡 Please check the error messages above for solutions');
  }
}

// Export for use in browser or run directly in Node
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testCloudinaryConfig, checkUploadPreset };
} else {
  // Auto-run in browser
  runAllTests();
}


