const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0ZrKmSUJf9mHC8K2uFYMrtiIEr8v2aR4",
  authDomain: "ucaes-2025.firebaseapp.com",
  projectId: "ucaes-2025",
  storageBucket: "ucaes-2025.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugCoursePrograms() {
  console.log('=== DEBUG: Course Program Names ===');
  
  try {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    const programsSnapshot = await getDocs(collection(db, 'programs'));
    
    console.log(`Found ${coursesSnapshot.size} courses and ${programsSnapshot.size} programs`);
    
    // Show all program names
    const programNames = [];
    programsSnapshot.forEach(doc => {
      const data = doc.data();
      programNames.push({ id: doc.id, name: data.name, code: data.code });
    });
    console.log('Program names:', programNames);
    
    // Show course program fields
    const coursePrograms = [];
    coursesSnapshot.forEach(doc => {
      const data = doc.data();
      coursePrograms.push({
        code: data.code,
        name: data.name,
        program: data.program,
        programName: data.programName,
        programId: data.programId,
        level: data.level,
        semester: data.semester
      });
    });
    
    console.log('\n=== Course Program Fields ===');
    coursePrograms.slice(0, 10).forEach(course => {
      console.log(`${course.code}: program="${course.program}" programName="${course.programName}" programId="${course.programId}"`);
    });
    
    // Group by program field
    const programGroups = {};
    coursePrograms.forEach(course => {
      const key = course.program || course.programName || course.programId || 'undefined';
      if (!programGroups[key]) programGroups[key] = 0;
      programGroups[key]++;
    });
    
    console.log('\n=== Program Distribution ===');
    Object.entries(programGroups).forEach(([program, count]) => {
      console.log(`${program}: ${count} courses`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugCoursePrograms();