// Script to check registered students in Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkRegisteredStudents() {
  try {
    console.log('Checking registered students in Firebase...');
    
    // Collections to check
    const collectionsToCheck = [
      'student-registrations',
      'registered-students',
      'students'
    ];
    
    for (const collectionName of collectionsToCheck) {
      try {
        console.log(`\nChecking ${collectionName} collection:`);
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        console.log(`Found ${querySnapshot.size} documents in ${collectionName}`);
        
        if (querySnapshot.size > 0) {
          // Show first document as example
          const firstDoc = querySnapshot.docs[0];
          console.log('Sample document structure:');
          console.log(JSON.stringify(firstDoc.data(), null, 2));
          
          // Count students by program
          const programCounts = {};
          querySnapshot.forEach(doc => {
            const data = doc.data();
            let program = '';
            
            if (collectionName === 'student-registrations') {
              program = data.academicInfo?.program || 'Unknown';
            } else if (collectionName === 'students') {
              program = data.program || 'Unknown';
            } else {
              program = data.program || data.academicInfo?.program || 'Unknown';
            }
            
            programCounts[program] = (programCounts[program] || 0) + 1;
          });
          
          console.log('\nStudents by program:');
          Object.entries(programCounts).forEach(([program, count]) => {
            console.log(`- ${program}: ${count} students`);
          });
          
          // Check for study modes (regular/weekend)
          const studyModes = {};
          querySnapshot.forEach(doc => {
            const data = doc.data();
            let mode = '';
            
            if (collectionName === 'student-registrations') {
              mode = data.academicInfo?.studyMode || 'Unknown';
            } else if (collectionName === 'students') {
              mode = data.studyMode || 'Unknown';
            } else {
              mode = data.studyMode || data.academicInfo?.studyMode || 'Unknown';
            }
            
            studyModes[mode] = (studyModes[mode] || 0) + 1;
          });
          
          console.log('\nStudents by study mode:');
          Object.entries(studyModes).forEach(([mode, count]) => {
            console.log(`- ${mode}: ${count} students`);
          });
          
          // Check for student IDs or index numbers
          console.log('\nSample student identifiers:');
          querySnapshot.docs.slice(0, 3).forEach(doc => {
            const data = doc.data();
            let identifier = '';
            
            if (collectionName === 'student-registrations') {
              identifier = data.studentId || data.indexNumber || doc.id;
            } else if (collectionName === 'students') {
              identifier = data.studentId || data.indexNumber || doc.id;
            } else {
              identifier = data.studentId || data.indexNumber || doc.id;
            }
            
            console.log(`- ${identifier}`);
          });
        }
      } catch (error) {
        console.error(`Error checking ${collectionName}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error checking registered students:', error);
  }
}

checkRegisteredStudents(); 