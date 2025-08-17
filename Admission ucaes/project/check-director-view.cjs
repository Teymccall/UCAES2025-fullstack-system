// Check Director View and Compare with Firebase Data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, orderBy } = require('firebase/firestore');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDirectorView() {
  try {
    console.log('🔍 Checking Director View vs Firebase Data...\n');

    // 1. Check all collections that might contain application data
    console.log('📊 1. Checking All Collections for Application Data:');
    console.log('===================================================');
    
    const collectionsToCheck = [
      'admission-applications',
      'applications', 
      'students',
      'student-registrations',
      'applicant-profiles',
      'user-applications'
    ];

    for (const collectionName of collectionsToCheck) {
      try {
        console.log(`\n🔍 Checking collection: ${collectionName}`);
        const ref = collection(db, collectionName);
        const snapshot = await getDocs(ref);
        
        if (snapshot.empty) {
          console.log(`   ❌ Collection ${collectionName} is empty`);
          continue;
        }

        console.log(`   📋 Found ${snapshot.size} documents`);
        
        // Look for documents with applicationId or registrationNumber
        let hasApplicationData = 0;
        let hasRegistrationData = 0;
        
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.applicationId) hasApplicationData++;
          if (data.registrationNumber) hasRegistrationData++;
        });

        console.log(`   📄 Documents with applicationId: ${hasApplicationData}`);
        console.log(`   📄 Documents with registrationNumber: ${hasRegistrationData}`);

        // Show first few documents with application data
        let count = 0;
        snapshot.forEach(doc => {
          if (count < 3) {
            const data = doc.data();
            if (data.applicationId || data.registrationNumber) {
              console.log(`   📄 ${doc.id}:`);
              console.log(`      Application ID: ${data.applicationId || 'N/A'}`);
              console.log(`      Registration Number: ${data.registrationNumber || 'N/A'}`);
              console.log(`      Name: ${data.name || data.applicantName || 'N/A'}`);
              count++;
            }
          }
        });

      } catch (error) {
        console.log(`   ⚠️ Error accessing ${collectionName}: ${error.message}`);
      }
    }

    // 2. Look specifically for UCAES20260028
    console.log('\n📊 2. Searching for UCAES20260028:');
    console.log('===================================');
    
    for (const collectionName of collectionsToCheck) {
      try {
        const ref = collection(db, collectionName);
        const query1 = query(ref, where('applicationId', '==', 'UCAES20260028'));
        const query2 = query(ref, where('registrationNumber', '==', 'UCAES20260028'));
        
        const snapshot1 = await getDocs(query1);
        const snapshot2 = await getDocs(query2);
        
        if (!snapshot1.empty) {
          console.log(`✅ Found UCAES20260028 as applicationId in ${collectionName}`);
          snapshot1.forEach(doc => {
            console.log(`   Document ID: ${doc.id}`);
            console.log(`   Data: ${JSON.stringify(doc.data(), null, 2)}`);
          });
        }
        
        if (!snapshot2.empty) {
          console.log(`✅ Found UCAES20260028 as registrationNumber in ${collectionName}`);
          snapshot2.forEach(doc => {
            console.log(`   Document ID: ${doc.id}`);
            console.log(`   Data: ${JSON.stringify(doc.data(), null, 2)}`);
          });
        }

      } catch (error) {
        console.log(`⚠️ Error searching ${collectionName}: ${error.message}`);
      }
    }

    // 3. Check for any documents with "humble ama" or similar names
    console.log('\n📊 3. Searching for "humble ama" applications:');
    console.log('==============================================');
    
    for (const collectionName of collectionsToCheck) {
      try {
        const ref = collection(db, collectionName);
        const query1 = query(ref, where('name', '==', 'humble ama'));
        const query2 = query(ref, where('applicantName', '==', 'humble ama'));
        const query3 = query(ref, where('email', '==', 'humbleama@gmail.com'));
        
        const snapshot1 = await getDocs(query1);
        const snapshot2 = await getDocs(query2);
        const snapshot3 = await getDocs(query3);
        
        if (!snapshot1.empty || !snapshot2.empty || !snapshot3.empty) {
          console.log(`✅ Found "humble ama" data in ${collectionName}`);
          
          [...snapshot1.docs, ...snapshot2.docs, ...snapshot3.docs].forEach(doc => {
            console.log(`   Document ID: ${doc.id}`);
            const data = doc.data();
            console.log(`   Application ID: ${data.applicationId || 'N/A'}`);
            console.log(`   Registration Number: ${data.registrationNumber || 'N/A'}`);
            console.log(`   Name: ${data.name || data.applicantName || 'N/A'}`);
            console.log(`   Email: ${data.email || 'N/A'}`);
            console.log(`   Status: ${data.status || data.applicationStatus || 'N/A'}`);
          });
        }

      } catch (error) {
        console.log(`⚠️ Error searching ${collectionName}: ${error.message}`);
      }
    }

    // 4. Check the current application counter state
    console.log('\n📊 4. Current Application Counter State:');
    console.log('=========================================');
    
    const countersRef = collection(db, 'application-counters');
    const countersSnapshot = await getDocs(countersRef);
    
    countersSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\n📈 Counter: ${doc.id}`);
      console.log(`   Last Number: ${data.lastNumber}`);
      console.log(`   Year: ${data.year}`);
      console.log(`   Updated: ${data.lastUpdated?.toDate?.() || data.lastUpdated}`);
      
      // Show what IDs this counter would generate
      const currentId = `${doc.id}${data.lastNumber.toString().padStart(4, "0")}`;
      const nextId = `${doc.id}${(data.lastNumber + 1).toString().padStart(4, "0")}`;
      console.log(`   Current ID: ${currentId}`);
      console.log(`   Next ID: ${nextId}`);
    });

    console.log('\n✅ Director view analysis complete!');

  } catch (error) {
    console.error('❌ Error in director view analysis:', error);
  }
}

if (require.main === module) {
  console.log('🚀 Starting Director View Analysis...\n');
  checkDirectorView()
    .then(() => {
      console.log('\n✅ Director view analysis completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Director view analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDirectorView };

