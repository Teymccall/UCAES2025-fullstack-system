const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
  let serviceAccount;
  try {
    // Look for service account key in several locations
    const possiblePaths = [
      '../serviceAccountKey.json', 
      '../../new student portal/serviceAccountKey.json',
      '../../new student information/serviceAccountKey.json'
    ];
    
    for (const relativePath of possiblePaths) {
      try {
        const fullPath = path.join(__dirname, relativePath);
        if (fs.existsSync(fullPath)) {
          serviceAccount = require(fullPath);
          console.log(`Using service account from: ${relativePath}`);
          break;
        }
      } catch (err) {
        // Continue to next path
      }
    }
    
    // If no file found, check for environment variable
    if (!serviceAccount) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('Using service account from environment variable');
      } else {
        throw new Error('No service account key found');
      }
    }
  } catch (err) {
    console.log('Service account key not found, checking for environment variable...');
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
      throw new Error('No service account key found');
    }
  }

  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://ucaes2025-default-rtdb.firebaseio.com',
    projectId: 'ucaes2025'
  });

  console.log('Firebase Admin initialized successfully for project: ucaes2025');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  process.exit(1);
}

const db = getFirestore();

// Helper function to print document
function printDocument(doc, includeId = true) {
  const data = doc.data();
  console.log('----------------------------------------');
  if (includeId) {
    console.log(`ID: ${doc.id}`);
  }
  
  // Print fields with special handling for some types
  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Date) {
      console.log(`${key}: ${value.toISOString().split('T')[0]}`);
    } else if (typeof value === 'object' && value !== null) {
      console.log(`${key}: ${JSON.stringify(value)}`);
    } else {
      console.log(`${key}: ${value}`);
    }
  });
  console.log('----------------------------------------');
}

async function verifyCollection(collectionName, limit = 3) {
  try {
    console.log(`\n=== Verifying ${collectionName} ===`);
    const snapshot = await db.collection(collectionName).limit(limit).get();
    
    if (snapshot.empty) {
      console.log(`❌ No documents found in ${collectionName} collection!`);
      return false;
    }
    
    console.log(`✅ Found ${snapshot.size} documents in ${collectionName} collection (showing max ${limit}):`);
    
    snapshot.forEach(doc => {
      printDocument(doc);
    });
    
    return true;
  } catch (error) {
    console.error(`❌ Error verifying ${collectionName}:`, error);
    return false;
  }
}

async function verifyCurriculumStructure() {
  try {
    console.log('\n=== Verifying curriculum-structure ===');
    const bscAgriDoc = await db.collection('curriculum-structure').doc('BSC-AGRI').get();
    const bscEsmDoc = await db.collection('curriculum-structure').doc('BSC-ESM').get();
    
    if (!bscAgriDoc.exists) {
      console.log('❌ BSC-AGRI curriculum structure not found!');
    } else {
      console.log('✅ BSC-AGRI curriculum structure exists:');
      const data = bscAgriDoc.data();
      console.log(`  - Program ID: ${data.programId}`);
      console.log(`  - Structure: ${data.structure.length} year/semester combinations`);
      
      // Sample the first structure entry
      if (data.structure.length > 0) {
        const firstStructure = data.structure[0];
        console.log(`  - First structure: Year ${firstStructure.year}, Semester ${firstStructure.semester}`);
        console.log(`    - Total Credits: ${firstStructure.totalCredits}`);
        console.log(`    - Courses: ${firstStructure.courses.join(', ')}`);
      }
    }
    
    if (!bscEsmDoc.exists) {
      console.log('❌ BSC-ESM curriculum structure not found!');
    } else {
      console.log('✅ BSC-ESM curriculum structure exists:');
      const data = bscEsmDoc.data();
      console.log(`  - Program ID: ${data.programId}`);
      console.log(`  - Structure: ${data.structure.length} year/semester combinations`);
    }
    
    return bscAgriDoc.exists && bscEsmDoc.exists;
  } catch (error) {
    console.error('❌ Error verifying curriculum structure:', error);
    return false;
  }
}

async function verifySpecializations() {
  try {
    console.log('\n=== Verifying program-specializations ===');
    
    // Verify Agronomy specialization
    const agronomyQuery = await db.collection('program-specializations')
      .where('code', '==', 'AGRONOMY')
      .limit(1)
      .get();
    
    if (agronomyQuery.empty) {
      console.log('❌ AGRONOMY specialization not found!');
    } else {
      console.log('✅ AGRONOMY specialization exists:');
      printDocument(agronomyQuery.docs[0]);
    }
    
    // Verify Environmental Health specialization
    const envHealthQuery = await db.collection('program-specializations')
      .where('code', '==', 'ENV-HEALTH')
      .limit(1)
      .get();
    
    if (envHealthQuery.empty) {
      console.log('❌ ENV-HEALTH specialization not found!');
    } else {
      console.log('✅ ENV-HEALTH specialization exists:');
      printDocument(envHealthQuery.docs[0]);
    }
    
    return !agronomyQuery.empty && !envHealthQuery.empty;
  } catch (error) {
    console.error('❌ Error verifying specializations:', error);
    return false;
  }
}

async function verifyCalendar() {
  try {
    console.log('\n=== Verifying academic-calendar ===');
    const calendarDoc = await db.collection('academic-calendar').doc('2024-2025').get();
    
    if (!calendarDoc.exists) {
      console.log('❌ Academic calendar for 2024-2025 not found!');
      return false;
    }
    
    console.log('✅ Academic calendar for 2024-2025 exists:');
    const data = calendarDoc.data();
    
    console.log(`Year: ${data.year}`);
    console.log(`Regular Semesters: ${data.regularSemesters.length}`);
    console.log(`Weekend Semesters: ${data.weekendSemesters.length}`);
    
    // Display first regular semester
    if (data.regularSemesters.length > 0) {
      const firstSem = data.regularSemesters[0];
      console.log('\nFirst Regular Semester:');
      console.log(`Name: ${firstSem.name}`);
      console.log(`Period: ${firstSem.period}`);
      console.log(`Classes: ${firstSem.classesStart.toDate().toDateString()} to ${firstSem.classesEnd.toDate().toDateString()}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verifying academic calendar:', error);
    return false;
  }
}

async function verifyCurriculum() {
  console.log('Starting curriculum data verification...');
  
  let success = true;
  
  // Verify academic programs
  success = await verifyCollection('academic-programs', 2) && success;
  
  // Verify courses
  success = await verifyCollection('academic-courses', 3) && success;
  
  // Verify specializations
  success = await verifySpecializations() && success;
  
  // Verify curriculum structure
  success = await verifyCurriculumStructure() && success;
  
  // Verify academic calendar
  success = await verifyCalendar() && success;
  
  if (success) {
    console.log('\n✅ All curriculum data verified successfully!');
  } else {
    console.log('\n⚠️ Some curriculum data is missing or incomplete.');
  }
  
  return success;
}

// Run the verification function
verifyCurriculum().then(() => {
  console.log('Verification process finished');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error during verification:', error);
  process.exit(1);
}); 