// Test Cloudinary upload using Node.js SDK
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dxkkv9nbn',
  api_key: '281612645352281',
  api_secret: 'YOUR_API_SECRET' // You'll need to provide this
})

async function testCloudinaryUpload() {
  try {
    console.log('🚀 Testing Cloudinary upload...')
    
    // Test upload with upload preset (unsigned)
    const result = await cloudinary.uploader.upload('test-image.png', {
      upload_preset: 'studentspassport',
      folder: 'test-uploads',
      tags: ['test', 'student-registration']
    })
    
    console.log('✅ Upload successful!')
    console.log('📊 Result:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      size: result.bytes
    })
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message)
    
    // Try unsigned upload
    try {
      console.log('🔄 Trying unsigned upload...')
      
      const formData = new FormData()
      formData.append('file', 'test-image.png')
      formData.append('upload_preset', 'studentspassport')
      
      const response = await fetch('https://api.cloudinary.com/v1_1/dxkkv9nbn/image/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Unsigned upload successful!')
        console.log('📊 Result:', result)
      } else {
        const errorText = await response.text()
        console.error('❌ Unsigned upload failed:', errorText)
      }
      
    } catch (unsignedError) {
      console.error('❌ Unsigned upload also failed:', unsignedError.message)
    }
  }
}

testCloudinaryUpload() 