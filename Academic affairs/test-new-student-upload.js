const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testNewStudentPhotoUpload() {
  console.log('🔍 Testing New Student Information Photo Upload...');
  console.log('');
  
  // Test the exact configuration used in the new student information system
  const CLOUDINARY_CLOUD_NAME = "dxkkv9nbn";
  const CLOUDINARY_UPLOAD_PRESET = "studentspassport";
  const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  console.log('📋 Configuration:');
  console.log(`   Cloud Name: ${CLOUDINARY_CLOUD_NAME}`);
  console.log(`   Upload Preset: ${CLOUDINARY_UPLOAD_PRESET}`);
  console.log(`   API URL: ${CLOUDINARY_API_URL}`);
  console.log('');
  
  try {
    // Create a test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0B, 0x13, 0x00, 0x00, 0x0B,
      0x13, 0x01, 0x00, 0x9A, 0x9C, 0x18, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44,
      0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x37,
      0x6E, 0xF9, 0x24, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    
    console.log('📤 Testing basic image upload...');
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-student.png',
      contentType: 'image/png'
    });
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Add the same parameters used in the app
    formData.append('quality', 'auto');
    formData.append('fetch_format', 'auto');
    formData.append('crop', 'fill');
    formData.append('gravity', 'face');
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ Upload successful!');
      console.log(`   📸 Image URL: ${result.secure_url}`);
      console.log(`   🆔 Public ID: ${result.public_id}`);
      console.log(`   📏 Dimensions: ${result.width}x${result.height}`);
      console.log(`   💾 Size: ${result.bytes} bytes`);
    } else {
      const errorText = await response.text();
      console.log('   ❌ Upload failed:');
      console.log(`      ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
  
  console.log('');
  console.log('🎯 DIAGNOSIS:');
  console.log('   If upload successful: Cloudinary config is working');
  console.log('   If upload failed: Check error message for specific issue');
  console.log('   Common issues: Invalid preset, CORS, file size, format');
}

testNewStudentPhotoUpload();




























