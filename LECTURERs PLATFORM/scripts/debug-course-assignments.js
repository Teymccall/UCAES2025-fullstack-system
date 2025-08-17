// Debug script to check course assignments and course data alignment
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  databaseURL: "https://collage-of-agricuture-default-rtdb.firebaseio.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugCourseAssignments() {
  try {
    console.log("🔍 Debugging course assignments and course data...\n");
    
    // Get the lecturer for hanamel.awenateyachumboro@gmail.com
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", "hanamel.awenateyachumboro@gmail.com"));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.log("❌ No lecturer found with email: hanamel.awenateyachumboro@gmail.com");
      return;
    }
    
    const lecturerId = userSnapshot.docs[0].id;
    const lecturerData = userSnapshot.docs[0].data();
    console.log("👨‍🏫 Lecturer found:");
    console.log(`   - ID: ${lecturerId}`);
    console.log(`   - Name: ${lecturerData.name}`);
    console.log(`   - Email: ${lecturerData.email}\n`);
    
    // Get lecturer assignments
    const assignmentsRef = collection(db, "lecturer-assignments");
    const assignmentsQuery = query(assignmentsRef, where("lecturerId", "==", lecturerId));
    const assignmentsSnapshot = await getDocs(assignmentsQuery);
    
    console.log(`📋 Found ${assignmentsSnapshot.docs.length} assignments:\n`);
    
    const assignments = assignmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Get all courses
    const coursesRef = collection(db, "academic-courses");
    const coursesSnapshot = await getDocs(coursesRef);
    
    console.log(`📚 Found ${coursesSnapshot.docs.length} courses in database:\n`);
    
    const courses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Show course details
    courses.forEach(course => {
      console.log(`   - Course ID: ${course.id} | Code: ${course.code} | Title: ${course.title}`);
    });
    
    console.log("\n📊 Assignment Analysis:\n");
    
    // Check each assignment
    assignments.forEach((assignment, index) => {
      const course = courses.find(c => c.id === assignment.courseId);
      console.log(`Assignment ${index + 1}:`);
      console.log(`   - Assignment ID: ${assignment.id}`);
      console.log(`   - Course ID: ${assignment.courseId}`);
      console.log(`   - Level: ${assignment.level}`);
      console.log(`   - Type: ${assignment.programmeCourseType}`);
      console.log(`   - Status: ${assignment.status}`);
      
      if (course) {
        console.log(`   ✅ Course Found: ${course.code} - ${course.title}`);
      } else {
        console.log(`   ❌ Course NOT FOUND for ID: ${assignment.courseId}`);
      }
      console.log('');
    });
    
    // Summary
    const foundCourses = assignments.filter(a => courses.find(c => c.id === a.courseId)).length;
    const missingCourses = assignments.length - foundCourses;
    
    console.log("📈 Summary:");
    console.log(`   - Total Assignments: ${assignments.length}`);
    console.log(`   - Courses Found: ${foundCourses}`);
    console.log(`   - Courses Missing: ${missingCourses}`);
    
    if (missingCourses > 0) {
      console.log("\n⚠️  Missing course IDs:");
      assignments.forEach(assignment => {
        const course = courses.find(c => c.id === assignment.courseId);
        if (!course) {
          console.log(`   - ${assignment.courseId}`);
        }
      });
    }
    
  } catch (error) {
    console.error("❌ Error debugging course assignments:", error);
  }
  
  process.exit(0);
}

debugCourseAssignments();























