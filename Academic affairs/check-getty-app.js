const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAuyOY9_N1P-JiSScRZtPqLJgRjpFoP7e4",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "43080328075",
  appId: "1:43080328075:web:9c158b0bf08de7aa4b12f5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkGettyApplication() {
  try {
    console.log('🔍 Checking for Getty\'s application...');
    
    // Check for UCAES202500001
    const admissionsRef = collection(db, 'admission-applications');
    const q = query(admissionsRef, where('applicationId', '==', 'UCAES202500001'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('❌ Application UCAES202500001 not found');
      
      // Let's see what applications exist
      console.log('\n📋 Checking all applications...');
      const allQuery = query(admissionsRef);
      const allSnapshot = await getDocs(allQuery);
      
      if (allSnapshot.empty) {
        console.log('❌ No applications found in database');
      } else {
        console.log(`✅ Found ${allSnapshot.size} applications:`);
        allSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`  - ${data.applicationId} (${data.personalInfo?.firstName} ${data.personalInfo?.lastName}) - Status: ${data.applicationStatus}`);
        });
      }
    } else {
      console.log('✅ Getty\'s application found!');
      const appData = querySnapshot.docs[0].data();
      console.log(`   Status: ${appData.applicationStatus}`);
      console.log(`   Name: ${appData.personalInfo?.firstName} ${appData.personalInfo?.lastName}`);
      console.log(`   Program: ${appData.programSelection?.firstChoice}`);
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkGettyApplication();




























