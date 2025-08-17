/**
 * Test script for verifying the authentication flow between 
 * student registration system and student portal
 * 
 * Run this script with Node.js to check if a registered student
 * can log in with their registration ID and date of birth
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit 
} = require('firebase/firestore');

// Firebase configuration - this should match both systems
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

// Function to normalize date string (same as in auth.ts)
function normalizeDateString(dateStr) {
  if (!dateStr) return '';
  
  // Trim any whitespace and remove any non-essential characters
  const cleaned = dateStr.trim().replace(/\s+/g, '');
  
  // Common date formats: DD-MM-YYYY, MM-DD-YYYY, YYYY-MM-DD, DD/MM/YYYY, etc.
  
  // First check if it's already in DD-MM-YYYY format
  const ddmmyyyyRegex = /^(\d{2})[-./](\d{2})[-./](\d{4})$/;
  const ddmmyyyyMatch = cleaned.match(ddmmyyyyRegex);
  
  if (ddmmyyyyMatch) {
    // Already in DD-MM-YYYY format, just standardize separators
    return `${ddmmyyyyMatch[1]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[3]}`;
  }
  
  // Try to parse as a date if it's a different format
  try {
    // For other formats, try a more flexible approach
    if (cleaned.length === 8 && /^\d{8}$/.test(cleaned)) {
      // Handle format DDMMYYYY without separators
      return `${cleaned.substring(0, 2)}-${cleaned.substring(2, 4)}-${cleaned.substring(4, 8)}`;
    }
    
    // Default fallback - just return the cleaned string
    return cleaned;
  } catch (e) {
    console.error('Error normalizing date:', e);
    // If all else fails, return the original cleaned string
    return cleaned;
  }
}

// Test verification function
async function testVerifyStudentLogin(studentId, dateOfBirth) {
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
    
    // Return student basic info
    const studentInfo = {
      id: studentDoc.id,
      name: `${studentData.surname} ${studentData.otherNames}`,
      registrationNumber: studentData.registrationNumber,
      studentIndexNumber: studentData.studentIndexNumber,
      programme: studentData.programme,
      email: studentData.email
    };
    
    console.log('Authentication successful!');
    console.log('Student info:', studentInfo);
    
    return true;
    
  } catch (error) {
    console.error('Error during verification:', error);
    return false;
  }
}

// Main function to run the test
async function main() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('Usage: node test-auth-flow.js <student-id> <date-of-birth>');
      console.log('Example: node test-auth-flow.js UCAES20239999 16-06-2000');
      process.exit(1);
    }
    
    const studentId = args[0];
    const dateOfBirth = args[1];
    
    console.log('-------------------------------------');
    console.log('TESTING STUDENT AUTHENTICATION FLOW');
    console.log('-------------------------------------');
    
    // Test the verification
    const result = await testVerifyStudentLogin(studentId, dateOfBirth);
    
    console.log('-------------------------------------');
    console.log(`RESULT: ${result ? 'LOGIN SUCCESSFUL' : 'LOGIN FAILED'}`);
    console.log('-------------------------------------');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    process.exit(0);
  }
}

// Run the main function
main(); 