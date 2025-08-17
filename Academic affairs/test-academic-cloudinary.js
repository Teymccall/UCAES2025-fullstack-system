import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cloudinary configuration for ACADEMIC AFFAIRS SYSTEM
const CLOUDINARY_CLOUD_NAME = "dxkkv9nbn";
const CLOUDINARY_UPLOAD_PRESET = "ucaes_academic_affairs";
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// Create a simple test image (1x1 pixel PNG)
function createTestImage() {
  // Simple 1x1 pixel PNG data
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xF8, 0xCF, 0xCF, 0x00,
    0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xDD, 0x8D, 0xB0, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  return pngData;
}

async function testAcademicCloudinaryUpload() {
  try {
    console.log('🧪 Testing ACADEMIC AFFAIRS Cloudinary Upload...');
    console.log('📋 Configuration:');
    console.log('   Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('   Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('   API URL:', CLOUDINARY_API_URL);
    
    // Create a test image
    const imageBuffer = createTestImage();
    console.log('✅ Test image created successfully, size:', imageBuffer.length, 'bytes');
    
    // Create FormData for upload
    const formData = new FormData();
    
    // Add the file as a buffer
    formData.append('file', imageBuffer, {
      filename: 'test-academic-upload.png',
      contentType: 'image/png'
    });
    
    // Add the upload preset
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'ucaes/academic-affairs/test-user/assignment/course101/semester1');
    formData.append('tags', 'academic-affairs,ucaes,academic-document,test');
    
    console.log('📦 FormData created with parameters:');
    console.log('   - upload_preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('   - folder: ucaes/academic-affairs/test-user/assignment/course101/semester1');
    console.log('   - tags: academic-affairs,ucaes,academic-document,test');
    
    // Make the upload request
    console.log('🌐 Sending request to Cloudinary...');
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });
    
    console.log('📡 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ACADEMIC AFFAIRS Upload failed:');
      console.error('   Error:', errorText);
      
      // Try to parse the error for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('   Parsed error:', errorJson);
      } catch (e) {
        console.error('   Raw error text:', errorText);
      }
      
      throw new Error(`ACADEMIC AFFAIRS Upload failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ ACADEMIC AFFAIRS Upload successful!');
    console.log('   Secure URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
    console.log('   Format:', result.format);
    console.log('   Size:', result.bytes, 'bytes');
    console.log('   Width:', result.width);
    console.log('   Height:', result.height);
    console.log('   Folder:', result.folder);
    console.log('   Tags:', result.tags);
    
    return result;
    
  } catch (error) {
    console.error('💥 ACADEMIC AFFAIRS Test failed:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
}

// Run the test
testAcademicCloudinaryUpload()
  .then(result => {
    console.log('\n🎉 ACADEMIC AFFAIRS Cloudinary upload test completed successfully!');
    console.log('📸 Image uploaded to:', result.secure_url);
    console.log('📁 Stored in folder:', result.folder);
    console.log('🏷️ Tags applied:', result.tags);
  })
  .catch(error => {
    console.error('\n❌ ACADEMIC AFFAIRS Cloudinary upload test failed!');
    console.error('   Error:', error.message);
    process.exit(1);
  }); 