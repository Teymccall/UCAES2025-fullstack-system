// test-firebase-auth.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, limit } = require('firebase/firestore');

// Firebase configuration - use the correct one
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",  // Using the one from new student information
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to normalize date string
function normalizeDateString(dateStr) {
  if (!dateStr) return '';
  
  // Clean the string
  const cleaned = dateStr.trim().replace(/\s+/g, '');
  
  // Check for DD-MM-YYYY format
  const ddmmyyyyRegex = /^(\d{2})[-./](\d{2})[-./](\d{4})$/;
  const ddmmyyyyMatch = cleaned.match(ddmmyyyyRegex);
  
  if (ddmmyyyyMatch) {
    return `${ddmmyyyyMatch[1]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[3]}`;
  }
  
  // Handle format without separators (DDMMYYYY)
  if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 4)}-${cleaned.substring(4, 8)}`;
  }
  
  // Return the cleaned string for other formats
  return cleaned;
}

// Test verification function
async function verifyStudentLogin(studentId, dateOfBirth) {
  try {
    console.log(`Testing login for student ID: ${studentId} with DOB: ${dateOfBirth}`);

    // First, find the student by ID
    const studentsRef = collection(db, 'student-registrations');
    const studentIdUpper = studentId.toUpperCase();
    
    let studentDoc = null;
    
    // Try multiple approaches to find the student
    console.log('Searching by registration number:', studentIdUpper);
    if (studentIdUpper.startsWith('UCAES')) {
      const regQuery = query(studentsRef, where('registrationNumber', '==', studentIdUpper), limit(1));
      const querySnapshot = await getDocs(regQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        console.log('Found by registration number');
      }
    }
    
    // If not found, try as index number
    if (!studentDoc) {
      console.log('Searching by index number:', studentIdUpper);
      const indexQuery = query(studentsRef, where('studentIndexNumber', '==', studentIdUpper), limit(1));
      const querySnapshot = await getDocs(indexQuery);
      
      if (!querySnapshot.empty) {
        studentDoc = querySnapshot.docs[0];
        console.log('Found by index number');
      }
    }
    
    // Check if student was found
    if (!studentDoc) {
      console.log(`ERROR: Student not found with ID: ${studentId}`);
      return false;
    }
    
    console.log('Student record found in database');
    
    // Verify DOB matches
    const studentData = studentDoc.data();
    
    console.log(`Stored DOB: ${studentData.dateOfBirth}`);
    console.log(`Entered DOB: ${dateOfBirth}`);
    
    // Normalize dates for comparison
    const normalizedInputDob = normalizeDateString(dateOfBirth);
    const normalizedStoredDob = normalizeDateString(studentData.dateOfBirth);
    
    console.log(`Normalized stored DOB: ${normalizedStoredDob}`);
    console.log(`Normalized input DOB: ${normalizedInputDob}`);
    
    if (normalizedInputDob !== normalizedStoredDob) {
      console.log('ERROR: Date of birth does not match the record');
      return false;
    }
    
    console.log('Date of birth verification successful');
    
    // Print student info
    console.log('Student info:');
    console.log(`ID: ${studentDoc.id}`);
    console.log(`Registration Number: ${studentData.registrationNumber || 'Not assigned'}`);
    console.log(`Name: ${studentData.surname || ''} ${studentData.otherNames || ''}`);
    console.log(`Email: ${studentData.email || 'Not provided'}`);
    console.log(`Programme: ${studentData.programme || 'Not assigned'}`);
    
    return true;
    
  } catch (error) {
    console.error('Error during verification:', error);
    return false;
  }
}

// Process command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node test-firebase-auth.js <registration-number> <date-of-birth>');
  console.log('Example: node test-firebase-auth.js UCAES20259770 16-06-2000');
  process.exit(1);
}

const studentId = args[0];
const dateOfBirth = args[1];

console.log('-------------------------------------');
console.log('TESTING STUDENT AUTHENTICATION');
console.log('-------------------------------------');

verifyStudentLogin(studentId, dateOfBirth)
  .then(result => {
    console.log('-------------------------------------');
    console.log(`RESULT: ${result ? 'LOGIN SUCCESSFUL' : 'LOGIN FAILED'}`);
    console.log('-------------------------------------');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  }); 