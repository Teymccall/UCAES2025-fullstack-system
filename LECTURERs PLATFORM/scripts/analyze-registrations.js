const admin = require('firebase-admin');
const fs = require('fs');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp();
} catch (error) {
  // App might already be initialized
  console.log('Firebase admin initialization error (may be already initialized):', error.message);
}

const db = admin.firestore();

// Function to analyze collections
async function analyzeCollections() {
  console.log('=== ANALYZING DATABASE STRUCTURE ===');
  
  try {
    // Get all collections
    const collections = await db.listCollections();
    console.log('Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    console.log('\n');
  } catch (error) {
    console.error('Error listing collections:', error);
  }
}

// Check the structure of registrations collection
async function analyzeRegistrations() {
  console.log('=== ANALYZING REGISTRATIONS COLLECTION ===');
  
  try {
    const registrationsRef = db.collection('registrations');
    const snapshot = await registrationsRef.limit(5).get();
    
    if (snapshot.empty) {
      console.log('No registrations found');
      return;
    }
    
    console.log(`Found ${snapshot.size} registrations. Analyzing structure:`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log(`\nRegistration ID: ${doc.id}`);
      console.log(`Fields: ${Object.keys(data).join(', ')}`);
      
      if (data.studentId) {
        console.log(`Student ID: ${data.studentId}`);
      }
      
      if (data.courses && Array.isArray(data.courses)) {
        console.log(`Courses: ${data.courses.length} courses registered`);
        console.log('Course structure sample:');
        console.log(JSON.stringify(data.courses[0], null, 2));
      }
      
      if (data.academicYearId) {
        console.log(`Academic Year ID: ${data.academicYearId}`);
      }
      
      if (data.academicSemesterId) {
        console.log(`Academic Semester ID: ${data.academicSemesterId}`);
      }
    });
  } catch (error) {
    console.error('Error analyzing registrations:', error);
  }
}

// Search for a specific student's registrations
async function findStudentRegistrations(studentIdentifier) {
  console.log(`=== SEARCHING FOR STUDENT: ${studentIdentifier} ===`);
  
  try {
    // Try different collections and fields where student registrations might be stored
    const collections = [
      'registrations',
      'course-registrations',
      'student-courses',
      'course-students'
    ];
    
    for (const collectionName of collections) {
      console.log(`\nChecking collection: ${collectionName}`);
      
      try {
        const collectionRef = db.collection(collectionName);
        
        // Try with studentId field
        let query = collectionRef.where('studentId', '==', studentIdentifier);
        let snapshot = await query.get();
        
        if (snapshot.empty) {
          // Try with registrationNumber field
          query = collectionRef.where('registrationNumber', '==', studentIdentifier);
          snapshot = await query.get();
        }
        
        if (snapshot.empty) {
          // Try with id field
          query = collectionRef.where('id', '==', studentIdentifier);
          snapshot = await query.get();
        }
        
        if (!snapshot.empty) {
          console.log(`Found ${snapshot.size} records in ${collectionName}`);
          snapshot.forEach(doc => {
            console.log(`Document ID: ${doc.id}`);
            console.log(JSON.stringify(doc.data(), null, 2));
          });
        } else {
          console.log(`No records found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`Error checking ${collectionName}:`, error.message);
      }
    }
    
    // Also check users and students collections
    const userCollections = ['users', 'students'];
    
    for (const collectionName of userCollections) {
      console.log(`\nChecking ${collectionName} collection`);
      
      try {
        const collectionRef = db.collection(collectionName);
        
        // Try with different identifier fields
        const fields = ['id', 'registrationNumber', 'indexNumber', 'email'];
        
        for (const field of fields) {
          const query = collectionRef.where(field, '==', studentIdentifier);
          const snapshot = await query.get();
          
          if (!snapshot.empty) {
            console.log(`Found student in ${collectionName} using field '${field}'`);
            snapshot.forEach(doc => {
              console.log(`Document ID: ${doc.id}`);
              console.log(JSON.stringify(doc.data(), null, 2));
            });
            break;
          }
        }
      } catch (error) {
        console.log(`Error checking ${collectionName}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error finding student registrations:', error);
  }
}

// Check course registrations
async function findCourseRegistrations(courseId) {
  console.log(`=== SEARCHING FOR COURSE REGISTRATIONS: ${courseId} ===`);
  
  try {
    // Try different collections where course registrations might be stored
    const collections = [
      'registrations',
      'course-registrations',
      'student-courses',
      'course-students'
    ];
    
    for (const collectionName of collections) {
      console.log(`\nChecking collection: ${collectionName}`);
      
      try {
        const collectionRef = db.collection(collectionName);
        
        // Try with courseId field
        let query = collectionRef.where('courseId', '==', courseId);
        let snapshot = await query.get();
        
        if (snapshot.empty && collectionName === 'registrations') {
          // For registrations collection, courses might be stored in an array
          // This is a bit more complex and would require examining each document
          console.log('Checking for course in registrations array field...');
          
          const allRegistrations = await collectionRef.get();
          let found = 0;
          
          allRegistrations.forEach(doc => {
            const data = doc.data();
            
            if (data.courses && Array.isArray(data.courses)) {
              // Check if this courseId exists in the courses array
              // Need to handle both object and string formats
              const hasCourse = data.courses.some(course => 
                (typeof course === 'object' && (course.courseId === courseId || course.id === courseId)) ||
                (typeof course === 'string' && course === courseId)
              );
              
              if (hasCourse) {
                found++;
                console.log(`Found course in registration document: ${doc.id}`);
                console.log(`Student ID: ${data.studentId || 'Not specified'}`);
              }
            }
          });
          
          console.log(`Found course in ${found} registration documents with array format`);
        }
        
        if (!snapshot.empty) {
          console.log(`Found ${snapshot.size} records in ${collectionName}`);
          snapshot.forEach(doc => {
            console.log(`Document ID: ${doc.id}`);
            console.log(`Student ID: ${doc.data().studentId || 'Not specified'}`);
          });
        } else {
          console.log(`No direct records found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`Error checking ${collectionName}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error finding course registrations:', error);
  }
}

// Find details about an academic year
async function findAcademicYear(yearId) {
  console.log(`=== SEARCHING FOR ACADEMIC YEAR: ${yearId} ===`);
  
  try {
    const yearRef = db.collection('academic-years').doc(yearId);
    const doc = await yearRef.get();
    
    if (doc.exists) {
      console.log('Academic Year Details:');
      console.log(JSON.stringify(doc.data(), null, 2));
    } else {
      console.log('Academic year not found');
    }
  } catch (error) {
    console.error('Error finding academic year:', error);
  }
}

// Main function
async function main() {
  console.log('Starting database analysis...');
  
  try {
    // Analyze overall structure
    await analyzeCollections();
    
    // Analyze registrations
    await analyzeRegistrations();
    
    // Check specific student registrations
    await findStudentRegistrations('UCAES20254119');
    
    // Check course registrations for specific courses
    await findCourseRegistrations('ESM 151');
    
    // Get current academic year details
    const academicYearsRef = db.collection('academic-years');
    const activeYears = await academicYearsRef.where('status', '==', 'active').get();
    
    if (!activeYears.empty) {
      const activeYearId = activeYears.docs[0].id;
      await findAcademicYear(activeYearId);
    }
    
    console.log('\nAnalysis complete!');
  } catch (error) {
    console.error('Error in main analysis:', error);
  } finally {
    process.exit(0);
  }
}

// Run the analysis
main(); 