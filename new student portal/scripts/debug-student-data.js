const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCouybHQDvQgDqN7k2zjlzRFyAONqjMr8A",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "871901532943",
  appId: "1:871901532943:web:6cfe18f2de741736ca8ab3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Check if a student session exists in localStorage
async function checkStudentSession() {
  try {
    // First check if the student exists in the database
    const studentId = 'UCAES20259770';
    const registrationsRef = collection(db, 'student-registrations');
    const regQuery = query(registrationsRef, where('registrationNumber', '==', studentId), limit(1));
    const querySnapshot = await getDocs(regQuery);
    
    if (!querySnapshot.empty) {
      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();
      console.log('Student found in database:');
      console.log('Name:', `${studentData.surname} ${studentData.otherNames}`);
      console.log('Programme:', studentData.programme);
      console.log('Registration Number:', studentData.registrationNumber);
      
      // Create a mock session data
      const sessionData = {
        isLoggedIn: true,
        studentId: studentId,
        sessionExpires: Date.now() + 8 * 60 * 60 * 1000, // 8 hours
        studentData: {
          ...studentData,
          id: studentDoc.id,
          _id: studentDoc.id
        }
      };
      
      console.log('\nSession data that would be stored:');
      console.log(JSON.stringify(sessionData, null, 2));
      
      // Check if there's any transformation that might change the name to TEST STUDENT
      if (studentData.surname === 'TEST' && studentData.otherNames === 'STUDENT') {
        console.log('\nWARNING: Student name is already "TEST STUDENT" in the database!');
      }
      
      // Check if there's a programme mismatch
      if (studentData.programme !== 'B.Sc. Agriculture') {
        console.log('\nNOTE: Programme mismatch detected.');
        console.log('Database programme:', studentData.programme);
        console.log('UI displayed programme:', 'B.Sc. Agriculture');
      }
    } else {
      console.log('Student not found in database');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkStudentSession(); 