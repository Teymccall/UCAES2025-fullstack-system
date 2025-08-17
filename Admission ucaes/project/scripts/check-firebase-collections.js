import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkFirebaseCollections() {
  console.log('🔍 Checking Firebase collections...');
  
  try {
    // Get all collections
    const collections = await getDocs(collection(db, 'admission-applications'));
    
    console.log(`📊 Found ${collections.docs.length} documents in 'admission-applications' collection`);
    
    if (collections.docs.length > 0) {
      console.log('\n📄 Sample documents:');
      collections.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1} (ID: ${doc.id}):`);
        console.log('- User ID:', data.userId);
        console.log('- Name:', data.personalInfo?.firstName, data.personalInfo?.lastName);
        console.log('- Email:', data.contactInfo?.email);
        console.log('- Status:', data.applicationStatus);
        console.log('- Created:', data.createdAt);
      });
    } else {
      console.log('❌ No documents found in admission-applications collection');
      console.log('\n💡 This could mean:');
      console.log('1. No applications have been submitted yet');
      console.log('2. Data is being saved to a different collection');
      console.log('3. Firebase configuration is incorrect');
      console.log('4. There are permission issues');
    }
    
    // Let's also check for other possible collections
    console.log('\n🔍 Checking for other possible collections...');
    
    const possibleCollections = [
      'applications',
      'admissions',
      'student-applications',
      'admission-forms',
      'student-admissions'
    ];
    
    for (const collectionName of possibleCollections) {
      try {
        const docs = await getDocs(collection(db, collectionName));
        if (docs.docs.length > 0) {
          console.log(`✅ Found ${docs.docs.length} documents in '${collectionName}' collection`);
        }
      } catch (error) {
        // Collection doesn't exist or no permission
        console.log(`❌ Collection '${collectionName}' not found or no access`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking Firebase collections:', error);
    console.log('\n💡 Possible issues:');
    console.log('1. Firebase configuration is incorrect');
    console.log('2. Network connectivity issues');
    console.log('3. Firebase project permissions');
    console.log('4. Firestore rules blocking access');
  }
}

// Run the check
checkFirebaseCollections(); 