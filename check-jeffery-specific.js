// Script to check jeffery achumboro's specific data in admission-applications
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

async function checkJefferyData() {
  try {
    console.log('🔍 Checking jeffery achumboro in admission-applications...');
    
    const admissionAppsRef = collection(db, 'admission-applications');
    const snapshot = await getDocs(admissionAppsRef);
    
    console.log(`📊 Total applications: ${snapshot.docs.length}`);
    
    let foundApplicant = null;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Check multiple possible name fields
      const firstName = data.personalInfo?.firstName || data.firstName || '';
      const lastName = data.personalInfo?.lastName || data.lastName || '';
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      
      if (fullName.includes('jeffery') || fullName.includes('achumboro') || 
          firstName.toLowerCase().includes('jeffery') || 
          lastName.toLowerCase().includes('achumboro')) {
        foundApplicant = { id: doc.id, ...data };
        console.log('✅ Found applicant:', doc.id);
      }
    });
    
    if (foundApplicant) {
      console.log('\n📋 COMPLETE DATA STRUCTURE:');
      console.log('Document ID:', foundApplicant.id);
      console.log('All keys:', Object.keys(foundApplicant));
      
      console.log('\n👤 PERSONAL INFO:');
      if (foundApplicant.personalInfo) {
        console.log('personalInfo object:', JSON.stringify(foundApplicant.personalInfo, null, 2));
      } else {
        console.log('No personalInfo object found');
      }
      
      console.log('\n📞 CONTACT INFO:');
      if (foundApplicant.contactInfo) {
        console.log('contactInfo object:', JSON.stringify(foundApplicant.contactInfo, null, 2));
      } else {
        console.log('No contactInfo object found');
      }
      
      console.log('\n🎓 ACADEMIC BACKGROUND:');
      if (foundApplicant.academicBackground) {
        console.log('academicBackground object:', JSON.stringify(foundApplicant.academicBackground, null, 2));
      } else {
        console.log('No academicBackground object found');
      }
      
      console.log('\n📚 PROGRAM SELECTION:');
      if (foundApplicant.programSelection) {
        console.log('programSelection object:', JSON.stringify(foundApplicant.programSelection, null, 2));
      } else {
        console.log('No programSelection object found');
      }
      
      console.log('\n📄 DOCUMENTS:');
      if (foundApplicant.documents) {
        console.log('documents object:', JSON.stringify(foundApplicant.documents, null, 2));
      } else {
        console.log('No documents object found');
      }
      
      console.log('\n⏰ TIMESTAMPS:');
      console.log('createdAt:', foundApplicant.createdAt);
      console.log('updatedAt:', foundApplicant.updatedAt);
      console.log('submittedAt:', foundApplicant.submittedAt);
      
      console.log('\n🔍 OTHER FIELDS:');
      console.log('applicationStatus:', foundApplicant.applicationStatus);
      console.log('paymentStatus:', foundApplicant.paymentStatus);
      console.log('currentStep:', foundApplicant.currentStep);
      console.log('applicationId:', foundApplicant.applicationId);
      
    } else {
      console.log('❌ jeffery achumboro not found in admission-applications');
      
      // Show first few applications to see the structure
      console.log('\n📋 First 3 applications structure:');
      snapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nApplication ${index + 1}:`);
        console.log('  ID:', doc.id);
        console.log('  Keys:', Object.keys(data));
        if (data.personalInfo) {
          console.log('  Name:', `${data.personalInfo.firstName || ''} ${data.personalInfo.lastName || ''}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkJefferyData();



