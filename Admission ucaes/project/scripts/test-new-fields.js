import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function testNewFields() {
  console.log('🧪 Testing new academic background fields...');
  
  try {
    // Sign in anonymously to get authentication
    console.log('🔐 Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('✅ Signed in as:', user.uid);
    
    // Create a test application with the new fields
    const testApplication = {
      userId: user.uid,
      personalInfo: {
        firstName: "Test",
        lastName: "Student",
        dateOfBirth: "01-01-2000",
        gender: "Male",
        nationality: "ghanaian",
        region: "greater-accra"
      },
      contactInfo: {
        phone: "+233123456789",
        email: "test@example.com",
        address: "123 Test Street, Accra, Ghana",
        emergencyContact: "Test Parent",
        emergencyPhone: "+233987654321"
      },
      academicBackground: {
        schoolName: "Test Senior High School",
        shsProgram: "General Science", // NEW FIELD
        waecIndexNumber: "1234567890", // NEW FIELD
        qualificationType: "wassce",
        yearCompleted: "2023",
        subjects: [
          { subject: "English Language", grade: "A1" },
          { subject: "Core Mathematics", grade: "B2" },
          { subject: "Biology", grade: "B3" }
        ],
        certificates: [] // NEW FIELD (will be File objects in real app)
      },
      programSelection: {
        program: "Bachelor of Agriculture",
        level: "Undergraduate",
        studyMode: "Full-time",
        firstChoice: "Bachelor of Agriculture",
        secondChoice: "Bachelor of Environmental Science"
      },
      documents: {},
      paymentStatus: "pending",
      applicationStatus: "draft",
      currentStep: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Submitting test application with new fields...');
    console.log('🔍 Academic Background Data:', JSON.stringify(testApplication.academicBackground, null, 2));
    
    const docRef = await addDoc(collection(db, "admission-applications"), testApplication);
    console.log('✅ Application submitted successfully!');
    console.log('📄 Document ID:', docRef.id);
    
    // Read it back to verify the fields were saved
    console.log('\n🔍 Reading back the application to verify new fields...');
    const querySnapshot = await getDocs(
      query(collection(db, "admission-applications"), where("userId", "==", user.uid))
    );
    
    if (querySnapshot.docs.length > 0) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      console.log('\n✅ Application retrieved successfully!');
      console.log('📊 Academic Background from Firebase:');
      console.log('- School Name:', data.academicBackground?.schoolName);
      console.log('- SHS Program:', data.academicBackground?.shsProgram); // NEW FIELD
      console.log('- WAEC Index:', data.academicBackground?.waecIndexNumber); // NEW FIELD
      console.log('- Qualification:', data.academicBackground?.qualificationType);
      console.log('- Year Completed:', data.academicBackground?.yearCompleted);
      console.log('- Subjects Count:', data.academicBackground?.subjects?.length || 0);
      console.log('- Certificates:', data.academicBackground?.certificates || []); // NEW FIELD
      
      // Verify new fields are present
      const hasNewFields = {
        shsProgram: !!data.academicBackground?.shsProgram,
        waecIndexNumber: !!data.academicBackground?.waecIndexNumber,
        certificates: Array.isArray(data.academicBackground?.certificates)
      };
      
      console.log('\n🔍 New Fields Verification:');
      console.log('- SHS Program present:', hasNewFields.shsProgram ? '✅' : '❌');
      console.log('- WAEC Index present:', hasNewFields.waecIndexNumber ? '✅' : '❌');
      console.log('- Certificates array present:', hasNewFields.certificates ? '✅' : '❌');
      
      if (hasNewFields.shsProgram && hasNewFields.waecIndexNumber && hasNewFields.certificates) {
        console.log('\n🎉 SUCCESS: All new fields are properly saved to Firebase!');
      } else {
        console.log('\n⚠️ WARNING: Some new fields may not be saving properly');
      }
    } else {
      console.log('❌ No application found');
    }
    
  } catch (error) {
    console.error('❌ Error testing new fields:', error);
    console.log('\n💡 Error details:');
    console.log('- Code:', error.code);
    console.log('- Message:', error.message);
  }
}

// Run the test
testNewFields();


