const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkPublishedGrades() {
  try {
    console.log('🔍 Checking published grades in student-grades collection...');
    
    // Check student-grades collection
    const studentGradesRef = collection(db, 'student-grades');
    const publishedGradesQuery = query(
      studentGradesRef,
      where('status', '==', 'published')
    );
    
    const publishedGradesSnapshot = await getDocs(publishedGradesQuery);
    
    console.log(`📊 Found ${publishedGradesSnapshot.size} published grades`);
    
    publishedGradesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📋 Grade document:', {
        id: doc.id,
        studentId: data.studentId,
        courseCode: data.courseCode,
        academicYear: data.academicYear,
        semester: data.semester,
        status: data.status,
        grade: data.grade,
        total: data.total
      });
    });
    
    // Also check grade-submissions collection
    console.log('\n🔍 Checking grade-submissions collection...');
    const submissionsRef = collection(db, 'grade-submissions');
    const publishedSubmissionsQuery = query(
      submissionsRef,
      where('status', '==', 'published')
    );
    
    const publishedSubmissionsSnapshot = await getDocs(publishedSubmissionsQuery);
    
    console.log(`📊 Found ${publishedSubmissionsSnapshot.size} published submissions`);
    
    publishedSubmissionsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📋 Submission document:', {
        id: doc.id,
        courseCode: data.courseCode,
        academicYear: data.academicYear,
        semester: data.semester,
        status: data.status,
        totalStudents: data.totalStudents
      });
    });
    
  } catch (error) {
    console.error('❌ Error checking published grades:', error);
  }
}

checkPublishedGrades(); 