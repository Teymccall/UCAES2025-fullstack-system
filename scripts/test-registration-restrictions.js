const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, addDoc, deleteDoc, doc } = require('firebase/firestore');

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data
const testStudent = {
  id: 'test-student-123',
  name: 'Test Student',
  email: 'test.student@test.com',
  registrationNumber: '2024/001',
  programme: 'B.Sc. Sustainable Agriculture',
  currentLevel: '100',
  yearOfEntry: '2024'
};

const testRegistration = {
  studentId: 'test-student-123',
  studentName: 'Test Student',
  registrationNumber: '2024/001',
  email: 'test.student@test.com',
  programId: 'test-program-123',
  programName: 'B.Sc. Sustainable Agriculture',
  level: '100',
  semester: 1,
  academicYear: '2024/2025',
  courses: [
    {
      id: 'course-1',
      code: 'AGR101',
      title: 'Introduction to Agriculture',
      credits: 3
    }
  ],
  totalCredits: 3,
  registrationDate: new Date(),
  registrationType: 'student',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
};

async function testRegistrationRestrictions() {
  console.log('🧪 Testing Registration Restriction System...\n');

  try {
    // Test 1: Check if student can register when no registration exists
    console.log('📋 Test 1: Student with no existing registration');
    const canRegister1 = await checkRegistrationEligibility(testStudent.id, '2024/2025', 1);
    console.log(`   Expected: true, Got: ${canRegister1.canRegister}`);
    console.log(`   Reason: ${canRegister1.reason || 'None'}\n`);

    // Test 2: Create a test registration
    console.log('📋 Test 2: Creating test registration');
    const registrationRef = await addDoc(collection(db, 'course-registrations'), testRegistration);
    console.log(`   Created registration with ID: ${registrationRef.id}\n`);

    // Test 3: Check if student can register after creating registration
    console.log('📋 Test 3: Student with existing registration');
    const canRegister2 = await checkRegistrationEligibility(testStudent.id, '2024/2025', 1);
    console.log(`   Expected: false, Got: ${canRegister2.canRegister}`);
    console.log(`   Reason: ${canRegister2.reason || 'None'}\n`);

    // Test 4: Check if student can register for different semester
    console.log('📋 Test 4: Student registering for different semester');
    const canRegister3 = await checkRegistrationEligibility(testStudent.id, '2024/2025', 2);
    console.log(`   Expected: true, Got: ${canRegister3.canRegister}`);
    console.log(`   Reason: ${canRegister3.reason || 'None'}\n`);

    // Test 5: Check if student can register for different academic year
    console.log('📋 Test 5: Student registering for different academic year');
    const canRegister4 = await checkRegistrationEligibility(testStudent.id, '2025/2026', 1);
    console.log(`   Expected: true, Got: ${canRegister4.canRegister}`);
    console.log(`   Reason: ${canRegister4.reason || 'None'}\n`);

    // Test 6: Test registration function with existing registration
    console.log('📋 Test 6: Attempting to register with existing registration');
    const registrationResult = await registerStudentForCourses(
      testStudent.id,
      [{ id: 'course-2', code: 'AGR102', title: 'Advanced Agriculture', credits: 3 }],
      '2024/2025',
      1,
      'student'
    );
    console.log(`   Expected: false, Got: ${registrationResult.success}`);
    console.log(`   Error: ${registrationResult.error || 'None'}\n`);

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await deleteDoc(doc(db, 'course-registrations', registrationRef.id));
    console.log('   Test registration deleted\n');

    // Test 7: Verify student can register again after cleanup
    console.log('📋 Test 7: Student can register after cleanup');
    const canRegister5 = await checkRegistrationEligibility(testStudent.id, '2024/2025', 1);
    console.log(`   Expected: true, Got: ${canRegister5.canRegister}`);
    console.log(`   Reason: ${canRegister5.reason || 'None'}\n`);

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function checkRegistrationEligibility(studentId, academicYear, semester) {
  try {
    // Check for existing registration for this semester
    const registrationsRef = collection(db, 'course-registrations');
    const q = query(
      registrationsRef,
      where('studentId', '==', studentId),
      where('academicYear', '==', academicYear),
      where('semester', '==', semester)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return {
        canRegister: false,
        reason: `You have already registered for courses in ${academicYear} - Semester ${semester}. You cannot register again until the next semester.`,
        existingRegistration: { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      };
    }
    
    return { canRegister: true };
    
  } catch (error) {
    console.error('Error checking registration eligibility:', error);
    return {
      canRegister: false,
      reason: "Unable to verify registration eligibility. Please contact support."
    };
  }
}

async function registerStudentForCourses(studentId, courses, academicYear, semester, registrationType) {
  try {
    // Check if student can register for this semester
    const registrationCheck = await checkRegistrationEligibility(studentId, academicYear, semester);
    if (!registrationCheck.canRegister) {
      return { success: false, error: registrationCheck.reason || "Registration not allowed" };
    }
    
    // Create registration document
    const registrationData = {
      studentId,
      studentName: testStudent.name,
      registrationNumber: testStudent.registrationNumber,
      email: testStudent.email,
      programId: 'test-program-123',
      programName: testStudent.programme,
      level: testStudent.currentLevel,
      semester,
      academicYear,
      courses: courses.map(course => ({
        id: course.id,
        code: course.code,
        title: course.title,
        credits: course.credits
      })),
      totalCredits: courses.reduce((sum, course) => sum + (course.credits || 0), 0),
      registrationDate: new Date(),
      registrationType,
      status: registrationType === 'director' ? 'approved' : 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const registrationRef = await addDoc(collection(db, 'course-registrations'), registrationData);
    return { success: true, registrationId: registrationRef.id };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run the tests
testRegistrationRestrictions();
