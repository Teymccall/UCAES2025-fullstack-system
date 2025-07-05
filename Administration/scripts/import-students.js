const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, query, where } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  // Your Firebase config here - same as in your lib/firebase.ts file
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Parse CSV string to array of objects
 */
const parseCSV = (csvText) => {
  // Split the CSV text into lines
  const lines = csvText.split('\n');
  
  // Extract header (first line)
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse the remaining lines
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    // Split the line by comma, handling quoted values
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    values.push(currentValue.trim());
    
    // Create an object from the values
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = values[j] || '';
    }
    
    result.push(obj);
  }
  
  return result;
};

/**
 * Validate a student record
 */
const validateStudent = (student) => {
  const requiredFields = [
    'indexNumber', 
    'surname', 
    'otherNames', 
    'gender', 
    'dateOfBirth', 
    'programme', 
    'level'
  ];
  
  const missingFields = requiredFields.filter(field => !student[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      errors: `Missing required fields: ${missingFields.join(', ')}`
    };
  }
  
  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(student.dateOfBirth)) {
    return {
      valid: false,
      errors: 'Date of birth must be in YYYY-MM-DD format'
    };
  }
  
  return { valid: true };
};

/**
 * Process and upload students to Firestore
 */
const importStudents = async (csvFilePath) => {
  try {
    // Read CSV file
    const csvContent = fs.readFileSync(csvFilePath, 'utf8');
    const students = parseCSV(csvContent);
    
    console.log(`Processing ${students.length} student records...`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const validation = validateStudent(student);
      
      if (!validation.valid) {
        console.error(`Error in row ${i + 2}: ${validation.errors}`);
        errors.push({
          row: i + 2,
          error: validation.errors,
          data: student
        });
        errorCount++;
        continue;
      }
      
      // Check if student already exists
      const q = query(
        collection(db, "students"),
        where("indexNumber", "==", student.indexNumber)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log(`Student with index number ${student.indexNumber} already exists. Skipping.`);
        continue;
      }
      
      // Prepare student data with required fields
      const studentData = {
        indexNumber: student.indexNumber,
        surname: student.surname,
        otherNames: student.otherNames,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        nationality: student.nationality || 'Ghanaian',
        programme: student.programme,
        level: student.level,
        entryQualification: student.entryQualification || 'WASSCE',
        status: student.status || 'Active',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        emergencyContact: {
          name: student.emergencyContactName || '',
          phone: student.emergencyContactPhone || '',
          relationship: student.emergencyContactRelationship || ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await setDoc(doc(collection(db, "students")), studentData);
      successCount++;
      
      console.log(`Added student: ${student.indexNumber} - ${student.surname}, ${student.otherNames}`);
    }
    
    console.log('\nImport Summary:');
    console.log(`Total processed: ${students.length}`);
    console.log(`Successfully imported: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\nErrors:');
      console.table(errors.map(e => ({ row: e.row, error: e.error, indexNumber: e.data.indexNumber })));
    }
    
  } catch (error) {
    console.error('Error importing students:', error);
  }
};

// CSV file path (you can also take it as a command-line argument)
const csvFilePath = process.argv[2] || path.join(__dirname, '../data/students.csv');

// Check if file exists
if (!fs.existsSync(csvFilePath)) {
  console.error(`File not found: ${csvFilePath}`);
  console.log('Usage: node import-students.js [path-to-csv-file]');
  process.exit(1);
}

// Start import
importStudents(csvFilePath)
  .then(() => {
    console.log('Import process completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error during import:', error);
    process.exit(1);
  }); 