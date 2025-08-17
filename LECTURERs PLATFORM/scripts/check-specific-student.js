// Script to check registration details for a specific student
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK without service account
// This works if you've logged in with firebase-cli
try {
  admin.initializeApp({
    // This will use application default credentials
    // No need for serviceAccountKey.json
  });
  console.log("Firebase admin initialized successfully");
} catch (error) {
  console.log('Firebase admin initialization error (may be already initialized):', error.message);
}

const db = admin.firestore();

// Search for a student by registration number and show all their course registrations
async function findStudentByRegistration(registrationNumber) {
  console.log(`Searching for student with registration number: ${registrationNumber}`);
  
  try {
    // First, try to find the student in the students collection
    const studentsRef = db.collection('students');
    const studentQuery = await studentsRef.where('registrationNumber', '==', registrationNumber).get();
    
    if (studentQuery.empty) {
      console.log(`No student found with registration number: ${registrationNumber}`);
      return;
    }
    
    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    console.log('\n==== STUDENT INFORMATION ====');
    console.log(`Student ID: ${studentDoc.id}`);
    console.log(`Registration Number: ${studentData.registrationNumber}`);
    console.log(`Name: ${studentData.firstName || ''} ${studentData.lastName || ''}`);
    console.log(`Email: ${studentData.email || 'N/A'}`);
    
    // Look for registrations in the course-registrations collection
    console.log('\n==== COURSE REGISTRATIONS ====');
    const regsRef = db.collection('course-registrations');
    const regsQuery = await regsRef.where('studentId', '==', studentDoc.id).get();
    
    if (regsQuery.empty) {
      console.log('No course registrations found');
    } else {
      console.log(`Found ${regsQuery.size} registrations`);
      
      regsQuery.forEach(doc => {
        const regData = doc.data();
        console.log('\n----- Registration -----');
        console.log(`ID: ${doc.id}`);
        
        // Print out all fields to see what's actually stored in the database
        console.log('\nEXACT FIELD VALUES (use these in your code):');
        Object.keys(regData).forEach(key => {
          const value = regData[key];
          if (key === 'courses' && Array.isArray(value)) {
            console.log(`${key}: Array with ${value.length} courses`);
            value.forEach((course, index) => {
              console.log(`  Course ${index + 1}:`);
              Object.keys(course).forEach(courseKey => {
                console.log(`    ${courseKey}: ${course[courseKey]}`);
              });
            });
          } else if (value && typeof value === 'object' && value.toDate) {
            // Handle Firestore timestamps
            console.log(`${key}: ${value.toDate().toISOString()}`);
          } else {
            console.log(`${key}: ${value}`);
          }
        });
      });
    }
    
    // Also look in registrations collection
    console.log('\n==== REGISTRATIONS ====');
    const oldRegsRef = db.collection('registrations');
    const oldRegsQuery = await oldRegsRef.where('registrationNumber', '==', registrationNumber).get();
    
    if (oldRegsQuery.empty) {
      console.log('No registrations found in registrations collection');
    } else {
      console.log(`Found ${oldRegsQuery.size} registrations in registrations collection`);
      
      oldRegsQuery.forEach(doc => {
        const regData = doc.data();
        console.log('\n----- Registration -----');
        console.log(`ID: ${doc.id}`);
        
        // Print out all fields to see what's actually stored in the database
        console.log('\nEXACT FIELD VALUES (use these in your code):');
        Object.keys(regData).forEach(key => {
          const value = regData[key];
          if (key === 'courses' && Array.isArray(value)) {
            console.log(`${key}: Array with ${value.length} courses`);
            value.forEach((course, index) => {
              console.log(`  Course ${index + 1}:`);
              if (typeof course === 'object') {
                Object.keys(course).forEach(courseKey => {
                  console.log(`    ${courseKey}: ${course[courseKey]}`);
                });
              } else {
                console.log(`    ${course}`);
              }
            });
          } else if (value && typeof value === 'object' && value.toDate) {
            // Handle Firestore timestamps
            console.log(`${key}: ${value.toDate().toISOString()}`);
          } else {
            console.log(`${key}: ${value}`);
          }
        });
      });
    }
    
    // Look for lecturer assignments for courses this student is registered for
    console.log('\n==== RELEVANT LECTURER ASSIGNMENTS ====');
    if (!regsQuery.empty) {
      // Collect all course IDs or codes from the student's registrations
      const studentCourses = [];
      
      regsQuery.forEach(doc => {
        const regData = doc.data();
        if (regData.courses && Array.isArray(regData.courses)) {
          regData.courses.forEach(course => {
            if (typeof course === 'object') {
              if (course.courseId) studentCourses.push(course.courseId);
              if (course.courseCode) studentCourses.push(course.courseCode);
            } else if (typeof course === 'string') {
              studentCourses.push(course);
            }
          });
        }
      });
      
      // If we found any course IDs, look for lecturer assignments
      if (studentCourses.length > 0) {
        console.log(`Looking for lecturer assignments for courses: ${studentCourses.join(', ')}`);
        
        const assignmentsRef = db.collection('lecturer-assignments');
        const promises = studentCourses.map(courseId => {
          // Try with both courseId and courseCode fields
          return Promise.all([
            assignmentsRef.where('courseId', '==', courseId).get(),
            assignmentsRef.where('courseCode', '==', courseId).get()
          ]);
        });
        
        const results = await Promise.all(promises.flat());
        let foundAssignments = false;
        
        for (const snapshot of results) {
          if (!snapshot.empty) {
            foundAssignments = true;
            snapshot.forEach(doc => {
              const assignmentData = doc.data();
              console.log('\n----- Lecturer Assignment -----');
              console.log(`ID: ${doc.id}`);
              
              // Print all fields
              Object.keys(assignmentData).forEach(key => {
                console.log(`${key}: ${assignmentData[key]}`);
              });
            });
          }
        }
        
        if (!foundAssignments) {
          console.log('No lecturer assignments found for these courses');
        }
      } else {
        console.log('No course IDs found in student registrations');
      }
    }
    
  } catch (error) {
    console.error('Error searching for student:', error);
  }
}

// Run the function with the registration number
const registrationNumber = process.argv[2] || 'UCAES20254119';
findStudentByRegistration(registrationNumber)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 