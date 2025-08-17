// Script to initialize the course-registrations collection in Firebase

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} = require('firebase/firestore');

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

// Function to check if a student exists
async function getStudentId(registrationNumber) {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('registrationNumber', '==', registrationNumber));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting student ID:', error);
    return null;
  }
}

// Function to check if a course exists
async function getCourseDetails(courseCode) {
  try {
    const coursesRef = collection(db, 'academic-courses');
    const q = query(coursesRef, where('code', '==', courseCode));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const courseDoc = querySnapshot.docs[0];
      return {
        id: courseDoc.id,
        ...courseDoc.data()
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting course details for ${courseCode}:`, error);
    return null;
  }
}

// Function to create a sample course registration
async function createSampleRegistration() {
  try {
    // Check if we have a student with registration number
    const studentId = await getStudentId('UCAES20250001');
    
    if (!studentId) {
      console.log('No student found with registration number UCAES20250001. Please create a student first.');
      return;
    }
    
    // Get course details for sample courses
    const course1 = await getCourseDetails('AGM 151');
    const course2 = await getCourseDetails('AGM 153');
    const course3 = await getCourseDetails('AGM 155');
    
    if (!course1 && !course2 && !course3) {
      console.log('No courses found with codes AGM 151, AGM 153, or AGM 155. Please seed courses first.');
      return;
    }
    
    // Prepare courses data
    const coursesData = [];
    
    if (course1) {
      coursesData.push({
        courseId: course1.id,
        courseCode: course1.code,
        courseName: course1.title,
        credits: course1.credits || 3
      });
    }
    
    if (course2) {
      coursesData.push({
        courseId: course2.id,
        courseCode: course2.code,
        courseName: course2.title,
        credits: course2.credits || 2
      });
    }
    
    if (course3) {
      coursesData.push({
        courseId: course3.id,
        courseCode: course3.code,
        courseName: course3.title,
        credits: course3.credits || 2
      });
    }
    
    // Calculate total credits
    const totalCredits = coursesData.reduce((sum, course) => sum + course.credits, 0);
    
    // Create registration data
    const registrationData = {
      studentId,
      studentName: 'John Doe', // This should be fetched from the student document
      academicYear: '2024-2025',
      semester: 'First Semester',
      level: '100',
      program: 'BSc. Sustainable Agriculture',
      studyMode: 'Regular',
      courses: coursesData,
      totalCredits,
      registrationDate: serverTimestamp(),
      status: 'approved',
      registeredBy: 'director'
    };
    
    // Add to course-registrations collection
    const docRef = await addDoc(collection(db, 'course-registrations'), registrationData);
    
    console.log(`Created sample course registration with ID: ${docRef.id}`);
    
  } catch (error) {
    console.error('Error creating sample registration:', error);
  }
}

// Function to check if the collection already has data
async function checkCollectionHasData() {
  try {
    const registrationsRef = collection(db, 'course-registrations');
    const querySnapshot = await getDocs(registrationsRef);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking collection:', error);
    return false;
  }
}

// Main function
async function initializeCourseRegistrations() {
  try {
    console.log('Checking if course-registrations collection has data...');
    
    const hasData = await checkCollectionHasData();
    
    if (hasData) {
      console.log('course-registrations collection already has data. Skipping initialization.');
      return;
    }
    
    console.log('Initializing course-registrations collection with sample data...');
    
    await createSampleRegistration();
    
    console.log('Initialization complete!');
    
  } catch (error) {
    console.error('Error initializing course-registrations:', error);
  }
}

// Run the initialization
initializeCourseRegistrations(); 