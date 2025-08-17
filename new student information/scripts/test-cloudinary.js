// Test script to verify Cloudinary configuration
// This script tests if Cloudinary is properly configured and can upload images

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = "dxkkv9nbn";
const CLOUDINARY_UPLOAD_PRESET = "UCAES2025";
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

async function testCloudinaryConfig() {
  console.log('🔍 Testing Cloudinary Configuration...\n');

  console.log('📋 Configuration Details:');
  console.log(`   Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`   Upload Preset: ${CLOUDINARY_UPLOAD_PRESET}`);
  console.log(`   API URL: ${CLOUDINARY_API_URL}`);
  console.log('');

  // Test 1: Simple upload preset test
  console.log('📤 Testing upload preset with minimal data...');
  try {
    const formData = new FormData();
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    console.log('FormData contents:');
    console.log(`  upload_preset: ${CLOUDINARY_UPLOAD_PRESET}`);

    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      console.log('✅ Upload preset is working!');
    } else {
      const errorText = await response.text();
      console.log(`❌ Upload preset error: ${response.status} - ${errorText}`);
      
      // Provide specific guidance based on error
      if (errorText.includes("Upload preset must be specified")) {
        console.log('\n🔧 Troubleshooting:');
        console.log('   - Make sure the upload preset "UCAES2025" exists in your Cloudinary dashboard');
        console.log('   - Ensure the preset is configured for "Unsigned" uploads');
        console.log('   - Check that the preset name is exactly "UCAES2025" (case sensitive)');
      }
    }
  } catch (error) {
    console.log('❌ Upload preset test failed:', error.message);
  }

  // Test 2: Test with a simple image
  console.log('\n🖼️ Testing with a simple image...');
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageData, 'base64');
    
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test.png',
      contentType: 'image/png'
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'test-uploads');
    formData.append('tags', 'test,ucaes,passport-photo-test');

    console.log('FormData contents for image upload:');
    console.log(`  file: [Buffer - ${testImageBuffer.length} bytes]`);
    console.log(`  upload_preset: ${CLOUDINARY_UPLOAD_PRESET}`);
    console.log(`  folder: test-uploads`);
    console.log(`  tags: test,ucaes,passport-photo-test`);

    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Test image upload successful!');
      console.log(`   URL: ${result.secure_url}`);
      console.log(`   Public ID: ${result.public_id}`);
      console.log(`   Format: ${result.format}`);
      console.log(`   Size: ${result.bytes} bytes`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Test image upload failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.log('❌ Test image upload failed:', error.message);
  }

  console.log('\n📋 Summary:');
  console.log('   If the upload preset test fails, you need to:');
  console.log('   1. Go to Cloudinary Dashboard → Settings → Upload');
  console.log('   2. Create a new upload preset named "UCAES2025"');
  console.log('   3. Set signing mode to "Unsigned"');
  console.log('   4. Save the preset');
  console.log('   If the image upload test fails, check your preset configuration.');
}

// Run the test
testCloudinaryConfig().then(() => {
  console.log('\n✅ Cloudinary configuration test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cloudinary configuration test failed:', error);
  process.exit(1);
}); 