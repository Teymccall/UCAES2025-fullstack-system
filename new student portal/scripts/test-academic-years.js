const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, orderBy, getDocs } = require('firebase/firestore');

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

async function testAcademicYears() {
  console.log('📚 Testing Academic Years Fetch...\n');

  try {
    // Step 1: Check academic-years collection
    console.log('📋 Step 1: Checking academic-years collection...');
    const yearsRef = collection(db, "academic-years");
    const yearsQuery = query(yearsRef, orderBy("year", "desc"));
    const yearsSnapshot = await getDocs(yearsQuery);
    
    if (yearsSnapshot.empty) {
      console.log('❌ No academic years found in the system.');
      console.log('💡 This might be why the dropdown is empty.');
      return;
    }

    console.log(`✅ Found ${yearsSnapshot.size} academic years:`);
    const years = [];
    yearsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   - ${data.year} (ID: ${doc.id}, Status: ${data.status || 'unknown'})`);
      years.push(data.year);
    });

    console.log('\n📊 Summary:');
    console.log(`   Total years: ${years.length}`);
    console.log(`   Years: ${years.join(', ')}`);
    
    // Check if there are any active years
    const activeYears = yearsSnapshot.docs.filter(doc => doc.data().status === 'active');
    console.log(`   Active years: ${activeYears.length}`);
    
    if (activeYears.length > 0) {
      console.log('✅ Active academic years found - dropdown should work!');
    } else {
      console.log('⚠️  No active academic years found - this might cause issues.');
    }

    // Step 2: Check system config
    console.log('\n📋 Step 2: Checking system config...');
    const { doc, getDoc } = require('firebase/firestore');
    const configRef = doc(db, "systemConfig", "academicPeriod");
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const configData = configSnap.data();
      console.log('✅ System config found:');
      console.log(`   Current Academic Year: ${configData.currentAcademicYear}`);
      console.log(`   Current Semester: ${configData.currentSemester}`);
      console.log(`   Last Updated: ${configData.lastUpdated?.toDate?.() || 'Unknown'}`);
    } else {
      console.log('❌ No system config found.');
    }

    console.log('\n✅ Academic years test completed successfully!');
    console.log('💡 The dropdown should now show the available academic years.');

  } catch (error) {
    console.error('❌ Error testing academic years:', error);
  }
}

// Run the test
testAcademicYears().then(() => {
  console.log('\n✅ Academic years test completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
}); 