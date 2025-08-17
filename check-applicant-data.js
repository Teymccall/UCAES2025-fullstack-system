// Script to check jeffery achumboro's application data structure
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkApplicantData() {
  try {
    console.log('🔍 Checking for jeffery achumboro in Firebase...');
    
    // Check admission-applications collection
    const admissionAppsRef = collection(db, 'admission-applications');
    const snapshot = await getDocs(admissionAppsRef);
    
    console.log(`📊 Found ${snapshot.docs.length} applications in admission-applications`);
    
    let foundApplicant = null;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.toLowerCase();
      
      if (fullName.includes('jeffery') || fullName.includes('achumboro')) {
        foundApplicant = { id: doc.id, ...data };
        console.log('✅ Found applicant:', doc.id);
      }
    });
    
    if (foundApplicant) {
      console.log('\n📋 APPLICANT DATA STRUCTURE:');
      console.log('ID:', foundApplicant.id);
      console.log('Raw data keys:', Object.keys(foundApplicant));
      
      // Check personal info structure
      console.log('\n👤 PERSONAL INFO:');
      if (foundApplicant.personalInfo) {
        console.log('personalInfo object:', foundApplicant.personalInfo);
      } else {
        console.log('No personalInfo object found');
        console.log('firstName (root):', foundApplicant.firstName);
        console.log('lastName (root):', foundApplicant.lastName);
        console.log('dateOfBirth (root):', foundApplicant.dateOfBirth);
        console.log('nationality (root):', foundApplicant.nationality);
        console.log('gender (root):', foundApplicant.gender);
        console.log('region (root):', foundApplicant.region);
      }
      
      // Check contact info structure
      console.log('\n📞 CONTACT INFO:');
      if (foundApplicant.contactInfo) {
        console.log('contactInfo object:', foundApplicant.contactInfo);
      } else {
        console.log('No contactInfo object found');
        console.log('email (root):', foundApplicant.email);
        console.log('phone (root):', foundApplicant.phone);
        console.log('address (root):', foundApplicant.address);
      }
      
      // Check academic background structure
      console.log('\n🎓 ACADEMIC BACKGROUND:');
      if (foundApplicant.academicBackground) {
        console.log('academicBackground object:', foundApplicant.academicBackground);
      } else {
        console.log('No academicBackground object found');
        console.log('schoolName (root):', foundApplicant.schoolName);
        console.log('qualificationType (root):', foundApplicant.qualificationType);
        console.log('yearCompleted (root):', foundApplicant.yearCompleted);
      }
      
      // Check program selection structure
      console.log('\n📚 PROGRAM SELECTION:');
      if (foundApplicant.programSelection) {
        console.log('programSelection object:', foundApplicant.programSelection);
      } else {
        console.log('No programSelection object found');
        console.log('firstChoice (root):', foundApplicant.firstChoice);
        console.log('secondChoice (root):', foundApplicant.secondChoice);
        console.log('studyMode (root):', foundApplicant.studyMode);
        console.log('studyLevel (root):', foundApplicant.studyLevel);
      }
      
      // Check documents structure
      console.log('\n📄 DOCUMENTS:');
      if (foundApplicant.documents) {
        console.log('documents object:', foundApplicant.documents);
      } else {
        console.log('No documents object found');
      }
      
      // Check timestamps
      console.log('\n⏰ TIMESTAMPS:');
      console.log('createdAt:', foundApplicant.createdAt);
      console.log('updatedAt:', foundApplicant.updatedAt);
      console.log('submittedAt:', foundApplicant.submittedAt);
      
    } else {
      console.log('❌ Applicant not found in admission-applications collection');
      
      // Check other possible collections
      console.log('\n🔍 Checking other collections...');
      
      const collections = ['applications', 'student-applications', 'admissions'];
      for (const collectionName of collections) {
        try {
          const colRef = collection(db, collectionName);
          const colSnapshot = await getDocs(colRef);
          console.log(`📊 ${collectionName}: ${colSnapshot.docs.length} documents`);
          
          colSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const fullName = `${data.firstName || ''} ${data.lastName || ''}`.toLowerCase();
            
            if (fullName.includes('jeffery') || fullName.includes('achumboro')) {
              console.log(`✅ Found in ${collectionName}:`, doc.id);
              console.log('Data structure:', Object.keys(data));
            }
          });
        } catch (error) {
          console.log(`❌ Error checking ${collectionName}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkApplicantData();



