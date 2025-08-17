// Test direct Cloudinary upload using fetch
import fs from 'fs'

async function testDirectUpload() {
  try {
    console.log('🚀 Testing direct Cloudinary upload...')
    
    // Read the test image file
    const imageBuffer = fs.readFileSync('test-image.png')
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', new Blob([imageBuffer], { type: 'image/png' }), 'test-image.png')
    formData.append('upload_preset', 'studentspassport')
    formData.append('folder', 'test-uploads')
    formData.append('tags', 'test,student-registration')
    
    console.log('📤 Uploading to Cloudinary...')
    console.log('   Cloud name: dxkkv9nbn')
    console.log('   Upload preset: studentspassport')
    console.log('   File size:', imageBuffer.length, 'bytes')
    
    const response = await fetch('https://api.cloudinary.com/v1_1/dxkkv9nbn/image/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log('📡 Response status:', response.status)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Upload successful!')
      console.log('📊 Result:', {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height
      })
    } else {
      const errorText = await response.text()
      console.error('❌ Upload failed:', errorText)
      
      // Try to parse error JSON
      try {
        const errorJson = JSON.parse(errorText)
        console.error('📋 Parsed error:', errorJson)
      } catch (e) {
        console.error('📋 Raw error text:', errorText)
      }
    }
    
  } catch (error) {
    console.error('❌ Error during upload:', error.message)
    console.error('   Stack:', error.stack)
  }
}

testDirectUpload() 