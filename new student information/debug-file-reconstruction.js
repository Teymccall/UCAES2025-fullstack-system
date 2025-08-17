// Debug script to test file reconstruction from localStorage
import { submitStudentRegistration } from './lib/firebase-service.js'

async function debugFileReconstruction() {
  console.log("🔍 DEBUGGING FILE RECONSTRUCTION PROCESS")
  
  // Simulate the localStorage data structure
  const mockFileData = {
    name: "test-image.jpg",
    type: "image/jpeg",
    size: 12345,
    data: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  }
  
  console.log("📄 Mock file data:", {
    name: mockFileData.name,
    type: mockFileData.type,
    size: mockFileData.size,
    hasData: !!mockFileData.data
  })
  
  try {
    // Convert base64 back to File object (same as in confirmation page)
    console.log("🔄 Converting base64 to File object...")
    const response = await fetch(mockFileData.data)
    const blob = await response.blob()
    const fileObject = new File([blob], mockFileData.name, {
      type: mockFileData.type,
      lastModified: Date.now()
    })
    
    console.log("✅ File object reconstructed:", {
      name: fileObject.name,
      size: fileObject.size,
      type: fileObject.type,
      lastModified: fileObject.lastModified
    })
    
    // Test if the file can be read
    console.log("📖 Testing file reading...")
    const arrayBuffer = await fileObject.arrayBuffer()
    console.log("✅ File can be read, size:", arrayBuffer.byteLength)
    
    // Test Cloudinary upload with this file
    console.log("☁️ Testing Cloudinary upload...")
    const formData = new FormData()
    formData.append('file', fileObject)
    formData.append('upload_preset', 'studentspassport')
    
    const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dxkkv9nbn/image/upload', {
      method: 'POST',
      body: formData
    })
    
    console.log("📡 Upload response status:", uploadResponse.status)
    
    if (uploadResponse.ok) {
      const result = await uploadResponse.json()
      console.log("✅ Upload successful:", {
        public_id: result.public_id,
        secure_url: result.secure_url,
        size: result.bytes
      })
    } else {
      const errorText = await uploadResponse.text()
      console.error("❌ Upload failed:", errorText)
    }
    
  } catch (error) {
    console.error("❌ Error in file reconstruction:", error)
  }
}

// Run the debug
debugFileReconstruction()
  .then(() => {
    console.log("🎉 Debug completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Debug failed:", error)
    process.exit(1)
  }) 