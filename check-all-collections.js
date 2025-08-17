// Script to check all collections in Firebase and find where applicant data is stored
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

async function checkAllCollections() {
  try {
    console.log('🔍 Checking all collections in Firebase...');
    
    // List of collections to check
    const collectionsToCheck = [
      'admission-applications',
      'applications', 
      'student-applications',
      'admissions',
      'student-records',
      'users',
      'students',
      'enrollments',
      'registrations'
    ];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const colRef = collection(db, collectionName);
        const snapshot = await getDocs(colRef);
        
        if (snapshot.docs.length > 0) {
          console.log(`\n📊 ${collectionName}: ${snapshot.docs.length} documents`);
          
          // Check first few documents for structure
          const firstDoc = snapshot.docs[0].data();
          console.log(`   First document keys: ${Object.keys(firstDoc).join(', ')}`);
          
          // Look for jeffery achumboro in this collection
          let foundApplicant = null;
          snapshot.docs.forEach(doc => {
            const data = doc.data();
            const fullName = `${data.firstName || data.first_name || ''} ${data.lastName || data.last_name || ''}`.toLowerCase();
            
            if (fullName.includes('jeffery') || fullName.includes('achumboro')) {
              foundApplicant = { id: doc.id, ...data };
              console.log(`   ✅ Found jeffery achumboro in ${collectionName}:`, doc.id);
            }
          });
          
          if (foundApplicant) {
            console.log(`   📋 Data structure for jeffery achumboro:`);
            console.log(`      Keys: ${Object.keys(foundApplicant).join(', ')}`);
            
            // Show key fields
            const keyFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'schoolName', 'qualificationType', 'firstChoice'];
            keyFields.forEach(field => {
              if (foundApplicant[field] !== undefined) {
                console.log(`      ${field}: "${foundApplicant[field]}"`);
              }
            });
          }
        } else {
          console.log(`📊 ${collectionName}: 0 documents`);
        }
      } catch (error) {
        console.log(`❌ Error checking ${collectionName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAllCollections();



