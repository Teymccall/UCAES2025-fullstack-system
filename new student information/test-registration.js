// Test script to verify student registration works even with Cloudinary issues
const { submitStudentRegistration } = require('./lib/firebase-service.ts');

async function testRegistration() {
  try {
    console.log('🧪 Testing Student Registration...');
    
    // Mock form data
    const mockFormData = {
      surname: "TEST",
      otherNames: "STUDENT",
      gender: "male",
      dateOfBirth: "01-01-2000",
      placeOfBirth: "TEST CITY",
      nationality: "GHANAIAN",
      religion: "CHRISTIAN",
      maritalStatus: "single",
      nationalId: "",
      ssnitNumber: "",
      physicalChallenge: "",
      studentIndexNumber: "TEST123",
      email: "test.student@test.com",
      mobile: "1234567890",
      street: "TEST STREET",
      city: "TEST CITY",
      country: "GHANA",
      guardianName: "TEST GUARDIAN",
      relationship: "parent",
      guardianContact: "0987654321",
      guardianEmail: "guardian@test.com",
      guardianAddress: "TEST ADDRESS",
      programme: "Computer Science",
      yearOfEntry: "2025",
      entryQualification: "WASSCE",
      entryLevel: "100",
      hallOfResidence: "TEST HALL",
      scheduleType: "Regular",
      currentLevel: "100",
      entryAcademicYear: "2025/2026",
      currentPeriod: "First Semester",
      profilePicture: null // No profile picture for this test
    };
    
    console.log('📋 Submitting test registration...');
    const registrationId = await submitStudentRegistration(mockFormData);
    
    console.log('✅ Registration successful!');
    console.log('   Registration ID:', registrationId);
    console.log('   Student Name:', mockFormData.surname, mockFormData.otherNames);
    console.log('   Email:', mockFormData.email);
    
    return registrationId;
    
  } catch (error) {
    console.error('❌ Registration test failed:', error.message);
    throw error;
  }
}

// Run the test
testRegistration()
  .then(registrationId => {
    console.log('\n🎉 Registration test completed successfully!');
    console.log('📋 Registration ID:', registrationId);
  })
  .catch(error => {
    console.error('\n❌ Registration test failed!');
    console.error('   Error:', error.message);
    process.exit(1);
  }); 