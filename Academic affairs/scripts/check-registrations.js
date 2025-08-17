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

async function checkRegistrations() {
  console.log("Checking registrations in the database...");

  try {
    // Check course-registrations collection
    const courseRegsSnapshot = await getDocs(collection(db, 'course-registrations'));
    console.log(`Found ${courseRegsSnapshot.size} documents in course-registrations collection`);
    
    if (courseRegsSnapshot.size > 0) {
      console.log("\nSample course registrations:");
      courseRegsSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Student: ${data.studentName || 'N/A'}`);
        console.log(`  Program: ${data.program || 'N/A'}`);
        console.log(`  Academic Year: ${data.academicYear || 'N/A'}`);
        console.log(`  Semester: ${data.semester || 'N/A'}`);
        console.log(`  Courses: ${data.courses?.length || 0}`);
        console.log('---');
      });
    }
    
    // Check student-registrations collection
    const studentRegsSnapshot = await getDocs(collection(db, 'student-registrations'));
    console.log(`\nFound ${studentRegsSnapshot.size} documents in student-registrations collection`);
    
    if (studentRegsSnapshot.size > 0) {
      console.log("\nSample student registrations:");
      studentRegsSnapshot.docs.slice(0, 3).forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Student: ${data.studentName || 'N/A'}`);
        console.log(`  Program: ${data.program || 'N/A'}`);
        console.log(`  Academic Year: ${data.academicYear || 'N/A'}`);
        console.log(`  Semester: ${data.semester || 'N/A'}`);
        console.log(`  Courses: ${data.courses?.length || 0}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error("Error checking registrations:", error);
  }
}

checkRegistrations(); 