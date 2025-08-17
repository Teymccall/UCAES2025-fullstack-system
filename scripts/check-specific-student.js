// Script to check for a specific student in the Firebase database
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

// Main function to check for the specific student
async function checkSpecificStudent() {
  try {
    const studentId = "UCAES20256661";
    console.log(`Searching for student with ID: ${studentId}`);
    
    // Get the student-registrations collection reference
    const registrationsRef = collection(db, 'student-registrations');
    
    // Try multiple approaches to find the student
    console.log('Checking by registration number...');
    let studentQuery = query(registrationsRef, where('registrationNumber', '==', studentId));
    let querySnapshot = await getDocs(studentQuery);
    
    if (querySnapshot.empty) {
      console.log('Not found by registration number, checking by index number...');
      studentQuery = query(registrationsRef, where('studentIndexNumber', '==', studentId));
      querySnapshot = await getDocs(studentQuery);
    }
    
    if (querySnapshot.empty) {
      console.log('Not found by index number, checking with uppercase...');
      studentQuery = query(registrationsRef, where('studentIndexNumber', '==', studentId.toUpperCase()));
      querySnapshot = await getDocs(studentQuery);
    }
    
    if (!querySnapshot.empty) {
      console.log('\n✅ Student found!');
      
      // Log all student details
      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        console.log('\nStudent Details:');
        console.log('---------------------');
        console.log(`Document ID: ${doc.id}`);
        console.log(`Registration Number: ${studentData.registrationNumber || 'Not set'}`);
        console.log(`Student Index Number: ${studentData.studentIndexNumber || 'Not set'}`);
        console.log(`Name: ${studentData.surname || ''} ${studentData.otherNames || ''}`);
        console.log(`Date of Birth: ${studentData.dateOfBirth || 'Not set'} (FORMAT CRITICAL FOR LOGIN)`);
        console.log(`Email: ${studentData.email || 'Not set'}`);
        console.log(`Status: ${studentData.status || 'Not set'}`);
        
        console.log('\nAll Fields:');
        console.log('---------------------');
        Object.entries(studentData).forEach(([key, value]) => {
          // Format dates and complex objects for better readability
          if (value instanceof Date) {
            console.log(`${key}: ${value.toISOString()}`);
          } else if (typeof value === 'object' && value !== null) {
            console.log(`${key}: ${JSON.stringify(value)}`);
          } else {
            console.log(`${key}: ${value}`);
          }
        });
      });
      
      console.log('\n📝 Login Instructions:');
      console.log(`Student ID: ${studentId}`);
      console.log('Date of Birth: Use the exact format shown above (e.g., 17-06-2000)');
    } else {
      console.log('\n❌ Student not found with ID:', studentId);
      
      // Check for any students in the collection to confirm it's working
      console.log('\nChecking for any students in the collection...');
      const allStudentsQuery = query(registrationsRef);
      const allStudentsSnapshot = await getDocs(allStudentsQuery);
      
      if (allStudentsSnapshot.empty) {
        console.log('No students found in the collection at all!');
      } else {
        console.log(`Found ${allStudentsSnapshot.size} other students in the collection.`);
        console.log('First few student IDs:');
        let count = 0;
        allStudentsSnapshot.forEach((doc) => {
          if (count < 3) {
            const data = doc.data();
            console.log(`- ${data.registrationNumber || data.studentIndexNumber || doc.id}`);
            count++;
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking for student:', error);
  }
}

// Run the script
checkSpecificStudent().catch(console.error); 