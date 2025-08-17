// Script to check student data in Firebase
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

async function checkStudentData() {
  try {
    console.log('Checking student data in Firebase...');
    
    // Check student-registrations collection
    const registrationsSnapshot = await getDocs(collection(db, 'student-registrations'));
    console.log(`Found ${registrationsSnapshot.size} student registrations`);
    
    if (registrationsSnapshot.size > 0) {
      // Show sample data structure
      const sampleRegistration = registrationsSnapshot.docs[0].data();
      console.log('Sample registration data structure:');
      console.log(JSON.stringify(sampleRegistration, null, 2));
    }
    
    // Check students collection
    const studentsSnapshot = await getDocs(collection(db, 'students'));
    console.log(`Found ${studentsSnapshot.size} students`);
    
    if (studentsSnapshot.size > 0) {
      // Show sample data structure
      const sampleStudent = studentsSnapshot.docs[0].data();
      console.log('Sample student data structure:');
      console.log(JSON.stringify(sampleStudent, null, 2));
    }
    
    // Check registered-students collection (might be used in the new student information system)
    const registeredStudentsSnapshot = await getDocs(collection(db, 'registered-students'));
    console.log(`Found ${registeredStudentsSnapshot.size} registered students`);
    
    if (registeredStudentsSnapshot.size > 0) {
      // Show sample data structure
      const sampleRegisteredStudent = registeredStudentsSnapshot.docs[0].data();
      console.log('Sample registered student data structure:');
      console.log(JSON.stringify(sampleRegisteredStudent, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking student data:', error);
  }
}

checkStudentData(); 