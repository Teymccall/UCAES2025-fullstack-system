const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

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

async function checkStudentData() {
  console.log('🔍 Checking Student Data Collections...\n');

  try {
    // Check all possible student collections
    const collections = [
      'student-registrations',
      'students', 
      'users',
      'registrations',
      'course-registrations'
    ];

    for (const collectionName of collections) {
      console.log(`📋 Checking ${collectionName} collection...`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        if (snapshot.empty) {
          console.log(`❌ No documents found in ${collectionName}`);
        } else {
          console.log(`✅ Found ${snapshot.size} documents in ${collectionName}`);
          
          // Show first few documents
          const docsToShow = Math.min(3, snapshot.size);
          for (let i = 0; i < docsToShow; i++) {
            const doc = snapshot.docs[i];
            const data = doc.data();
            console.log(`\n📄 Document ${i + 1} in ${collectionName}:`);
            console.log(`   ID: ${doc.id}`);
            console.log(`   Data keys: ${Object.keys(data).join(', ')}`);
            
            // Show key fields if they exist
            if (data.email) console.log(`   Email: ${data.email}`);
            if (data.registrationNumber) console.log(`   Registration: ${data.registrationNumber}`);
            if (data.studentIndexNumber) console.log(`   Index: ${data.studentIndexNumber}`);
            if (data.indexNumber) console.log(`   Index (alt): ${data.indexNumber}`);
            if (data.surname) console.log(`   Name: ${data.surname} ${data.otherNames || ''}`);
            if (data.firstName) console.log(`   Name (alt): ${data.firstName} ${data.lastName || ''}`);
          }
        }
      } catch (error) {
        console.log(`❌ Error accessing ${collectionName}: ${error.message}`);
      }
    }

    // Now test the grade lookup with actual data
    console.log('\n🔍 Testing grade lookup with actual data...');
    
    // Get a sample published grade
    const studentGradesRef = collection(db, 'student-grades');
    const publishedQuery = query(studentGradesRef, where('status', '==', 'published'));
    const publishedSnapshot = await getDocs(publishedQuery);
    
    if (!publishedSnapshot.empty) {
      const sampleGrade = publishedSnapshot.docs[0];
      const gradeData = sampleGrade.data();
      const studentId = gradeData.studentId;
      
      console.log(`\n📄 Sample published grade:`);
      console.log(`   Student ID: ${studentId}`);
      console.log(`   Course: ${gradeData.courseName || gradeData.courseCode}`);
      console.log(`   Grade: ${gradeData.grade} (${gradeData.total}/100)`);
      
      // Try to find this student in different collections
      console.log(`\n🔍 Looking for student with ID: ${studentId}`);
      
      for (const collectionName of collections) {
        try {
          const collectionRef = collection(db, collectionName);
          
          // Try different search strategies
          const searchStrategies = [
            { field: 'email', value: studentId },
            { field: 'registrationNumber', value: studentId },
            { field: 'studentIndexNumber', value: studentId },
            { field: 'indexNumber', value: studentId }
          ];
          
          for (const strategy of searchStrategies) {
            try {
              const queryRef = query(collectionRef, where(strategy.field, '==', strategy.value));
              const querySnapshot = await getDocs(queryRef);
              
              if (!querySnapshot.empty) {
                console.log(`✅ Found in ${collectionName} by ${strategy.field}: ${strategy.value}`);
                const foundDoc = querySnapshot.docs[0];
                const foundData = foundDoc.data();
                console.log(`   Document ID: ${foundDoc.id}`);
                console.log(`   Name: ${foundData.surname || foundData.firstName} ${foundData.otherNames || foundData.lastName || ''}`);
                console.log(`   Email: ${foundData.email}`);
                console.log(`   Registration: ${foundData.registrationNumber || foundData.studentIndexNumber || foundData.indexNumber}`);
              }
            } catch (error) {
              // Ignore field not found errors
            }
          }
        } catch (error) {
          console.log(`❌ Error searching ${collectionName}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking student data:', error);
  }
}

// Run the check
checkStudentData().then(() => {
  console.log('\n✅ Student data check completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Check failed:', error);
  process.exit(1);
}); 