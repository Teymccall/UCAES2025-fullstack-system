// Script to test student login credentials against Firebase
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit } = require('firebase/firestore');

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

// Main function to test login
async function testLogin() {
  try {
    const credentials = {
      studentId: "UCAES20256661",
      dateOfBirth: "17-06-2000"
    };

    console.log(`Testing login with:
- Student ID: ${credentials.studentId}
- Date of Birth: ${credentials.dateOfBirth}`);
    
    // Get the student-registrations collection reference
    const registrationsRef = collection(db, 'student-registrations');
    let studentDoc = null;
    let studentQuery;
    
    // Try multiple approaches to find the student (similar to the actual login flow)
    // First check: Is this a registration number that starts with UCAES?
    if (credentials.studentId.toUpperCase().startsWith('UCAES')) {
      console.log('Searching by registration number...');
      studentQuery = query(registrationsRef, where('registrationNumber', '==', credentials.studentId), limit(1));
      const querySnapshot = await getDocs(studentQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        console.log('✅ Found by registration number!');
      } else {
        console.log('❌ Not found by registration number');
      }
    }
    
    // Second check: If not found, try as index number
    if (!studentDoc) {
      console.log('Searching by index number...');
      studentQuery = query(registrationsRef, where('studentIndexNumber', '==', credentials.studentId.toUpperCase()), limit(1));
      const querySnapshot = await getDocs(studentQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        console.log('✅ Found by index number!');
      } else {
        console.log('❌ Not found by index number');
      }
    }
    
    // Third check: Try by studentIdentifier
    if (!studentDoc) {
      console.log('Searching by studentIdentifier...');
      studentQuery = query(registrationsRef, where('studentIdentifier', '==', credentials.studentId), limit(1));
      const querySnapshot = await getDocs(studentQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        console.log('✅ Found by studentIdentifier!');
      } else {
        console.log('❌ Not found by studentIdentifier');
      }
    }
    
    if (studentDoc) {
      const studentData = studentDoc.data();
      
      console.log(`\n✅ Student found!
Name: ${studentData.surname} ${studentData.otherNames}
ID: ${studentData.registrationNumber || studentData.studentIndexNumber || studentData.studentIdentifier}
Date of Birth: ${studentData.dateOfBirth}`);

      // Verify date of birth matches
      if (studentData.dateOfBirth === credentials.dateOfBirth) {
        console.log('\n✅ Date of birth matches! Login would be successful.');
      } else {
        console.log(`\n❌ Date of birth does not match!
- Expected: ${credentials.dateOfBirth}
- Found: ${studentData.dateOfBirth}`);
      }
    } else {
      console.log('\n❌ Student not found with any search method.');
    }
  } catch (error) {
    console.error('❌ Error testing login:', error);
  }
}

// Run the script
testLogin().catch(console.error); 