// Test script to verify passport photo functionality
// Run this script to check if passport photos are being uploaded and stored correctly

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration (same as in your app)
const firebaseConfig = {
  apiKey: "AIzaSyBxGQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "ucaes-2025.firebaseapp.com",
  projectId: "ucaes-2025",
  storageBucket: "ucaes-2025.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testPassportPhotos() {
  console.log('🔍 Testing Passport Photo Functionality...\n');

  try {
    // Get all student registrations
    console.log('📋 Fetching student registrations...');
    const registrationsRef = collection(db, 'student-registrations');
    const snapshot = await getDocs(registrationsRef);
    
    let totalRegistrations = 0;
    let withPhotos = 0;
    let withoutPhotos = 0;
    let uploadErrors = 0;

    console.log('\n📊 Analyzing registrations:\n');

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalRegistrations++;

      console.log(`👤 ${data.surname} ${data.otherNames}`);
      console.log(`   📧 Email: ${data.email}`);
      console.log(`   📋 Registration: ${data.registrationNumber}`);
      console.log(`   📸 Photo URL: ${data.profilePictureUrl || 'Not set'}`);
      console.log(`   🆔 Photo Public ID: ${data.profilePicturePublicId || 'Not set'}`);
      console.log(`   📊 Status: ${data.status}`);
      
      if (data.profilePictureUrl) {
        withPhotos++;
        console.log(`   ✅ Has photo`);
      } else if (data.status === 'image_upload_failed') {
        uploadErrors++;
        console.log(`   ❌ Upload failed: ${data.uploadError || 'Unknown error'}`);
      } else {
        withoutPhotos++;
        console.log(`   ⚠️ No photo uploaded`);
      }
      console.log('');
    });

    console.log('📈 Summary:');
    console.log(`   Total registrations: ${totalRegistrations}`);
    console.log(`   With photos: ${withPhotos}`);
    console.log(`   Without photos: ${withoutPhotos}`);
    console.log(`   Upload errors: ${uploadErrors}`);
    console.log(`   Success rate: ${((withPhotos / totalRegistrations) * 100).toFixed(1)}%`);

    // Test specific registration if provided
    if (process.argv[2]) {
      const testId = process.argv[2];
      console.log(`\n🔍 Testing specific registration: ${testId}`);
      
      const docRef = doc(db, 'student-registrations', testId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ Registration found:');
        console.log(`   Name: ${data.surname} ${data.otherNames}`);
        console.log(`   Photo URL: ${data.profilePictureUrl || 'Not set'}`);
        console.log(`   Photo Public ID: ${data.profilePicturePublicId || 'Not set'}`);
        console.log(`   Status: ${data.status}`);
        
        if (data.profilePictureUrl) {
          console.log('   ✅ Photo is properly stored');
        } else {
          console.log('   ❌ Photo is missing');
        }
      } else {
        console.log('❌ Registration not found');
      }
    }

  } catch (error) {
    console.error('❌ Error testing passport photos:', error);
  }
}

// Run the test
testPassportPhotos().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 