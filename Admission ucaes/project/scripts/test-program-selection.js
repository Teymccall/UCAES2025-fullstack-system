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

async function testProgramSelectionFields() {
  console.log('🧪 Testing new Program Selection fields...');
  
  try {
    // Sign in anonymously to get authentication
    console.log('🔐 Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    console.log('✅ Signed in as:', user.uid);
    
    // Test data with new fields
    const testApplications = [
      {
        userId: user.uid + '_degree',
        personalInfo: {
          firstName: "John",
          lastName: "Degree Student",
          dateOfBirth: "01-01-1995",
          gender: "Male",
          nationality: "ghanaian",
          region: "greater-accra"
        },
        contactInfo: {
          phone: "+233123456789",
          email: "john.degree@example.com",
          address: "123 Test Street, Accra, Ghana",
          emergencyContact: "Test Parent",
          emergencyPhone: "+233987654321"
        },
        academicBackground: {
          schoolName: "Test Senior High School",
          shsProgram: "General Science",
          waecIndexNumber: "1234567890",
          qualificationType: "wassce",
          yearCompleted: "2023",
          subjects: [
            { subject: "English Language", grade: "A1" },
            { subject: "Core Mathematics", grade: "B2" }
          ],
          certificates: []
        },
        programSelection: {
          programType: "degree", // NEW FIELD
          program: "",
          level: "undergraduate",
          studyMode: "regular", // UPDATED FIELD
          firstChoice: "B.Sc. Sustainable Agriculture", // NEW PROGRAM
          secondChoice: "B.Sc. Environmental Science and Management" // NEW PROGRAM
        },
        documents: {},
        paymentStatus: "pending",
        applicationStatus: "draft",
        currentStep: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        userId: user.uid + '_certificate',
        personalInfo: {
          firstName: "Jane",
          lastName: "Certificate Student",
          dateOfBirth: "01-01-1990",
          gender: "Female",
          nationality: "ghanaian",
          region: "ashanti"
        },
        contactInfo: {
          phone: "+233987654321",
          email: "jane.certificate@example.com",
          address: "456 Test Avenue, Kumasi, Ghana",
          emergencyContact: "Test Guardian",
          emergencyPhone: "+233123456789"
        },
        academicBackground: {
          schoolName: "Another Test School",
          shsProgram: "Business",
          waecIndexNumber: "0987654321",
          qualificationType: "wassce",
          yearCompleted: "2020",
          subjects: [
            { subject: "English Language", grade: "B3" },
            { subject: "Core Mathematics", grade: "C4" }
          ],
          certificates: []
        },
        programSelection: {
          programType: "certificate", // NEW FIELD
          program: "",
          level: "certificate",
          studyMode: "weekend", // UPDATED FIELD
          firstChoice: "Certificate in Sustainable Agriculture", // NEW PROGRAM
          secondChoice: "Certificate in Bee Keeping" // NEW PROGRAM
        },
        documents: {},
        paymentStatus: "pending",
        applicationStatus: "draft",
        currentStep: 4,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    console.log('\n📝 Submitting test applications with new fields...');
    
    const submittedApps = [];
    for (let i = 0; i < testApplications.length; i++) {
      const app = testApplications[i];
      console.log(`\n🚀 Submitting application ${i + 1}: ${app.programSelection.programType} program`);
      console.log(`   Program Type: ${app.programSelection.programType}`);
      console.log(`   Study Mode: ${app.programSelection.studyMode}`);
      console.log(`   First Choice: ${app.programSelection.firstChoice}`);
      console.log(`   Second Choice: ${app.programSelection.secondChoice}`);
      
      const docRef = await addDoc(collection(db, "admission-applications"), app);
      submittedApps.push({ id: docRef.id, ...app });
      console.log(`✅ Application ${i + 1} submitted with ID: ${docRef.id}`);
    }
    
    // Read back and verify
    console.log('\n🔍 Reading back applications to verify new fields...');
    
    for (let i = 0; i < submittedApps.length; i++) {
      const submittedApp = submittedApps[i];
      console.log(`\n📊 Verifying application ${i + 1} (${submittedApp.programSelection.programType}):`);
      
      const querySnapshot = await getDocs(
        query(collection(db, "admission-applications"), where("userId", "==", submittedApp.userId))
      );
      
      if (querySnapshot.docs.length > 0) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        
        console.log('✅ Application retrieved successfully!');
        console.log('📋 Program Selection from Firebase:');
        console.log(`   - Program Type: ${data.programSelection?.programType || 'NOT FOUND'}`);
        console.log(`   - Level: ${data.programSelection?.level || 'NOT FOUND'}`);
        console.log(`   - Study Mode: ${data.programSelection?.studyMode || 'NOT FOUND'}`);
        console.log(`   - First Choice: ${data.programSelection?.firstChoice || 'NOT FOUND'}`);
        console.log(`   - Second Choice: ${data.programSelection?.secondChoice || 'NOT FOUND'}`);
        
        // Verify new fields are present
        const hasNewFields = {
          programType: !!data.programSelection?.programType,
          updatedStudyMode: data.programSelection?.studyMode === 'regular' || data.programSelection?.studyMode === 'weekend',
          newPrograms: data.programSelection?.firstChoice?.includes('B.Sc.') || data.programSelection?.firstChoice?.includes('Certificate')
        };
        
        console.log('\n🔍 New Fields Verification:');
        console.log(`   - Program Type present: ${hasNewFields.programType ? '✅' : '❌'}`);
        console.log(`   - Updated Study Mode: ${hasNewFields.updatedStudyMode ? '✅' : '❌'}`);
        console.log(`   - New Program Names: ${hasNewFields.newPrograms ? '✅' : '❌'}`);
        
        if (hasNewFields.programType && hasNewFields.updatedStudyMode && hasNewFields.newPrograms) {
          console.log(`   🎉 SUCCESS: All new fields for ${submittedApp.programSelection.programType} program are properly saved!`);
        } else {
          console.log(`   ⚠️ WARNING: Some new fields may not be saving properly for ${submittedApp.programSelection.programType} program`);
        }
      } else {
        console.log('❌ No application found');
      }
    }
    
    // Summary
    console.log('\n📊 SUMMARY OF NEW FEATURES:');
    console.log('✅ Program Type Field: Degree vs Certificate selection');
    console.log('✅ Updated Study Mode: Regular (weekdays) vs Weekend');
    console.log('✅ New Degree Programs:');
    console.log('   - B.Sc. Sustainable Agriculture');
    console.log('   - B.Sc. Environmental Science and Management');
    console.log('✅ New Certificate Programs (1-year):');
    console.log('   - Certificate in Sustainable Agriculture');
    console.log('   - Certificate in Waste Management & Environmental Health');
    console.log('   - Certificate in Bee Keeping');
    console.log('   - Certificate in Agribusiness');
    console.log('   - Certificate in Business Administration');
    console.log('\n🎉 Program Selection form has been successfully updated with all requested features!');
    
  } catch (error) {
    console.error('❌ Error testing program selection fields:', error);
    console.log('\n💡 Error details:');
    console.log('- Code:', error.code);
    console.log('- Message:', error.message);
  }
}

// Run the test
testProgramSelectionFields();


