// Debug script to find registered students
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('Firebase admin initialization error (may be already initialized):', error.message);
}

const db = admin.firestore();

// Function to search for a specific student registration
async function findStudentRegistration(studentId) {
  console.log(`Looking for registrations for student: ${studentId}`);
  
  // Check registrations collection
  try {
    const regsRef = db.collection("registrations");
    const regsSnapshot = await regsRef.where("studentId", "==", studentId).get();
    
    console.log(`Found ${regsSnapshot.size} registrations in 'registrations' collection`);
    
    regsSnapshot.forEach(doc => {
      console.log(`Registration ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } catch (error) {
    console.log("Error checking registrations:", error.message);
  }
  
  // Check course-registrations collection
  try {
    const courseRegsRef = db.collection("course-registrations");
    const courseRegsSnapshot = await courseRegsRef.where("studentId", "==", studentId).get();
    
    console.log(`Found ${courseRegsSnapshot.size} registrations in 'course-registrations' collection`);
    
    courseRegsSnapshot.forEach(doc => {
      console.log(`Registration ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } catch (error) {
    console.log("Error checking course-registrations:", error.message);
  }
}

// Function to find course registrations
async function findCourseRegistrations(courseId) {
  console.log(`Looking for registrations for course: ${courseId}`);
  
  // Check registrations collection
  try {
    const regsRef = db.collection("registrations");
    const regsSnapshot = await regsRef.get();
    
    console.log("Checking 'registrations' collection for courses in arrays");
    
    let foundCount = 0;
    regsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        // Check if this course is in the array
        const hasCourse = data.courses.some(course => {
          if (typeof course === 'string') return course === courseId;
          if (typeof course === 'object') {
            return course.courseId === courseId || 
                   course.id === courseId ||
                   course.courseCode === courseId || 
                   course.code === courseId;
          }
          return false;
        });
        
        if (hasCourse) {
          foundCount++;
          console.log(`Found registration with ID: ${doc.id}`);
          console.log(`Student ID: ${data.studentId}`);
          console.log(`Registration number: ${data.registrationNumber}`);
          console.log(`Academic year: ${data.academicYear || data.academicYearId}`);
          console.log(`Semester: ${data.semester || data.academicSemesterId || data.semesterId}`);
          console.log('---');
        }
      }
    });
    
    console.log(`Found ${foundCount} registrations with course ${courseId} in 'registrations' collection`);
  } catch (error) {
    console.log("Error checking registrations:", error.message);
  }
  
  // Check course-registrations collection
  try {
    const courseRegsRef = db.collection("course-registrations");
    const courseRegsSnapshot = await courseRegsRef.where("courseId", "==", courseId).get();
    
    console.log(`Found ${courseRegsSnapshot.size} registrations in 'course-registrations' collection`);
    
    courseRegsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Registration ID: ${doc.id}`);
      console.log(`Student ID: ${data.studentId}`);
      console.log(`Registration number: ${data.registrationNumber}`);
      console.log(`Academic year: ${data.academicYear || data.academicYearId}`);
      console.log(`Semester: ${data.semester || data.academicSemesterId || data.semesterId}`);
      console.log('---');
    });
  } catch (error) {
    console.log("Error checking course-registrations:", error.message);
  }
}

// Execute the search functions with the specified IDs
async function main() {
  // Replace these with the actual IDs you're looking for
  const studentId = "UCAES20254119"; 
  const courseId = "ESM 151";
  
  console.log("======= STUDENT REGISTRATION SEARCH =======");
  await findStudentRegistration(studentId);
  
  console.log("\n======= COURSE REGISTRATION SEARCH =======");
  await findCourseRegistrations(courseId);
  
  process.exit(0);
}

main();































