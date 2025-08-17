const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

// Function to normalize a date string to a standard format (DD-MM-YYYY)
const normalizeDateString = (dateStr) => {
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
};

// Search for student by ID
async function findStudentById(studentId) {
  try {
    console.log(`Searching for student with ID: ${studentId}`);
    
    const studentIdUpper = studentId.toUpperCase();
    const registrationsRef = collection(db, 'student-registrations');
    
    // Try different queries
    const queries = [
      query(registrationsRef, where('registrationNumber', '==', studentIdUpper)),
      query(registrationsRef, where('studentIndexNumber', '==', studentIdUpper)),
      query(registrationsRef, where('indexNumber', '==', studentIdUpper))
    ];
    
    for (let i = 0; i < queries.length; i++) {
      const querySnapshot = await getDocs(queries[i]);
      
      if (!querySnapshot.empty) {
        console.log(`Found student using query #${i + 1}`);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Document ID:', doc.id);
          console.log('Registration Number:', data.registrationNumber);
          console.log('Student Index Number:', data.studentIndexNumber || data.indexNumber);
          
          // Date of birth analysis
          console.log('Date of Birth (raw):', data.dateOfBirth);
          console.log('Date of Birth (normalized):', normalizeDateString(data.dateOfBirth));
          
          // Check comparison with expected value
          const expectedDOB = '16-06-2000';
          console.log('Expected DOB (normalized):', normalizeDateString(expectedDOB));
          console.log('Matches expected DOB:', normalizeDateString(data.dateOfBirth) === normalizeDateString(expectedDOB));
          
          // Show complete record in detail
          console.log('\nComplete Record:');
          console.log(JSON.stringify(data, null, 2));
        });
        return;
      }
    }
    
    console.log('No student found with that ID');
  } catch (error) {
    console.error('Error finding student:', error);
  }
}

// Main function
async function main() {
  const studentId = process.argv[2] || 'UCAES20259770';
  await findStudentById(studentId);
  process.exit(0);
}

main(); 