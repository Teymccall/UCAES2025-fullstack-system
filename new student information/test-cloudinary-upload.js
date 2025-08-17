const fs = require('fs');
const path = require('path');

// Cloudinary configuration - Updated with working credentials
const CLOUDINARY_CLOUD_NAME = "dxkkv9nbn";
const CLOUDINARY_UPLOAD_PRESET = "studentspassport"; // Using the correct preset name from dashboard
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

async function testCloudinaryUpload() {
  try {
    console.log('🧪 Testing Cloudinary Upload...');
    console.log('📋 Configuration:');
    console.log('   Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('   Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('   API URL:', CLOUDINARY_API_URL);
    
    // Read the test image file
    const imagePath = path.join(__dirname, 'public', 'placeholder-user.jpg');
    console.log('📄 Reading image file:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      throw new Error('Test image file not found');
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    console.log('✅ Image file read successfully, size:', imageBuffer.length, 'bytes');
    
    // Create FormData for upload - using a simpler approach
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add the file as a buffer
    formData.append('file', imageBuffer, {
      filename: 'test-upload.jpg',
      contentType: 'image/jpeg'
    });
    
    // Add the upload preset
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    console.log('📦 FormData created with parameters:');
    console.log('   - upload_preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('   - file: test-upload.jpg');
    
    // Make the upload request
    console.log('🌐 Sending request to Cloudinary...');
    
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header - let FormData set it with boundary
      }
    });
    
    console.log('📡 Response received:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload failed:');
      console.error('   Error:', errorText);
      
      // Try to parse the error for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('   Parsed error:', errorJson);
      } catch (e) {
        console.error('   Raw error text:', errorText);
      }
      
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload successful!');
    console.log('   Secure URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
    console.log('   Format:', result.format);
    console.log('   Size:', result.bytes, 'bytes');
    console.log('   Width:', result.width);
    console.log('   Height:', result.height);
    
    return result;
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    console.error('   Stack:', error.stack);
    throw error;
  }
}

// Run the test
testCloudinaryUpload()
  .then(result => {
    console.log('\n🎉 Cloudinary upload test completed successfully!');
    console.log('📸 Image uploaded to:', result.secure_url);
  })
  .catch(error => {
    console.error('\n❌ Cloudinary upload test failed!');
    console.error('   Error:', error.message);
    process.exit(1);
  }); 