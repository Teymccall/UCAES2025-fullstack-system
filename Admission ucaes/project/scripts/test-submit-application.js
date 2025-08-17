import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
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

async function testSubmitApplication() {
  console.log('🧪 Testing application submission...');
  
  try {
    // First, sign in anonymously to get authentication
    console.log('🔐 Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('✅ Signed in as:', user.uid);
    
    // Create a test application
    const testApplication = {
      userId: user.uid,
      personalInfo: {
        firstName: "Test",
        lastName: "Student",
        dateOfBirth: "2000-01-01",
        gender: "Male",
        nationality: "Zambian",
        region: "Lusaka"
      },
      contactInfo: {
        phone: "+260123456789",
        email: "test@example.com",
        address: "123 Test Street, Lusaka",
        emergencyContact: "Test Parent",
        emergencyPhone: "+260987654321"
      },
      academicBackground: {
        schoolName: "Test High School",
        qualificationType: "Grade 12",
        yearCompleted: "2023",
        subjects: [
          { subject: "Mathematics", grade: "A" },
          { subject: "English", grade: "B" }
        ]
      },
      programSelection: {
        program: "Bachelor of Agriculture",
        level: "Undergraduate",
        studyMode: "Full-time",
        firstChoice: "Bachelor of Agriculture",
        secondChoice: "Bachelor of Environmental Science"
      },
      documents: {
        photo: { url: "https://example.com/photo.jpg", publicId: "test_photo" },
        idDocument: { url: "https://example.com/id.jpg", publicId: "test_id" }
      },
      paymentStatus: "pending",
      applicationStatus: "submitted",
      currentStep: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Submitting test application...');
    const docRef = await addDoc(collection(db, "admission-applications"), testApplication);
    console.log('✅ Application submitted successfully!');
    console.log('📄 Document ID:', docRef.id);
    
    // Now let's try to read it back
    console.log('\n🔍 Reading back the submitted application...');
    const querySnapshot = await getDocs(collection(db, "admission-applications"));
    console.log(`📊 Found ${querySnapshot.docs.length} total applications`);
    
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nDocument ${index + 1}:`);
      console.log('- ID:', doc.id);
      console.log('- User ID:', data.userId);
      console.log('- Name:', data.personalInfo?.firstName, data.personalInfo?.lastName);
      console.log('- Email:', data.contactInfo?.email);
      console.log('- Status:', data.applicationStatus);
      console.log('- Created:', data.createdAt);
    });
    
  } catch (error) {
    console.error('❌ Error testing application submission:', error);
    console.log('\n💡 Error details:');
    console.log('- Code:', error.code);
    console.log('- Message:', error.message);
  }
}

// Run the test
testSubmitApplication(); 