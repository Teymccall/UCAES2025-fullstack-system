// Test script to verify registration with image upload
import { submitStudentRegistration } from './lib/firebase-service.js'

async function testRegistrationWithImage() {
  console.log("🧪 TESTING REGISTRATION WITH IMAGE UPLOAD")
  
  // Create a mock file for testing
  const mockImageData = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
  
  try {
    // Convert base64 to File object
    const response = await fetch(mockImageData)
    const blob = await response.blob()
    const testFile = new File([blob], "test-student.jpg", {
      type: "image/jpeg",
      lastModified: Date.now()
    })
    
    console.log("✅ Test file created:", {
      name: testFile.name,
      size: testFile.size,
      type: testFile.type
    })
    
    // Create mock form data
    const mockFormData = {
      surname: "TEST",
      otherNames: "STUDENT",
      gender: "male",
      dateOfBirth: "2000-01-01",
      placeOfBirth: "TEST CITY",
      nationality: "GHANAIAN",
      religion: "CHRISTIAN",
      maritalStatus: "single",
      nationalId: "",
      ssnitNumber: "",
      physicalChallenge: "none",
      studentIndexNumber: "",
      email: `test.student.${Date.now()}@test.com`,
      mobile: "0200000000",
      street: "TEST STREET",
      city: "TEST CITY",
      country: "GHANA",
      guardianName: "TEST GUARDIAN",
      relationship: "parent",
      guardianContact: "0200000001",
      guardianEmail: "guardian@test.com",
      guardianAddress: "TEST GUARDIAN ADDRESS",
      programme: "Computer Science",
      yearOfEntry: "2025",
      entryQualification: "WASSCE",
      entryLevel: "100",
      hallOfResidence: "TEST HALL",
      profilePicture: {
        url: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
        name: "test-student.jpg",
        type: "image/jpeg",
        size: 12345,
        hasImage: true,
        isFileObject: true
      }
    }
    
    console.log("📋 Mock form data created")
    console.log("📧 Email:", mockFormData.email)
    
    // Test the registration
    console.log("🚀 Starting registration test...")
    const registrationId = await submitStudentRegistration(mockFormData, testFile)
    
    console.log("✅ Registration successful!")
    console.log("🆔 Registration ID:", registrationId)
    console.log("📧 Student email:", mockFormData.email)
    
  } catch (error) {
    console.error("❌ Registration test failed:", error)
    console.error("   Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}

// Run the test
testRegistrationWithImage()
  .then(() => {
    console.log("🎉 Test completed!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("💥 Test failed:", error)
    process.exit(1)
  }) 