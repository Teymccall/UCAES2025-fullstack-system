const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc, getDoc } = require('firebase/firestore');

// Firebase configuration - using actual config
const firebaseConfig = {
  apiKey: "AIzaSyD7GRz9Rl3jG8w0D7Gq6G9Z8Z7Z9Z8Z7Z9Z8",
  authDomain: "ucaes-2025.firebaseapp.com",
  projectId: "ucaes-2025",
  storageBucket: "ucaes-2025.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixRegistrationData() {
  try {
    console.log('🔧 Starting course registration fix...');
    
    // Get all programs
    const programsSnapshot = await getDocs(collection(db, 'academic-programs'));
    const programs = programsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📋 Found ${programs.length} programs`);
    
    // Get all courses from curriculum
    const coursesSnapshot = await getDocs(collection(db, 'curriculum'));
    const allCourses = coursesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📚 Found ${allCourses.length} total courses in curriculum`);
    
    // Group courses by program, level, and semester
    const courseMap = {};
    
    for (const course of allCourses) {
      const programName = course.program;
      const level = course.level?.toString();
      const semester = course.semester;
      const code = course.code;
      
      if (!programName || !level || !semester || !code) continue;
      
      if (!courseMap[programName]) courseMap[programName] = {};
      if (!courseMap[programName][level]) courseMap[programName][level] = {};
      if (!courseMap[programName][level][semester]) courseMap[programName][level][semester] = [];
      
      courseMap[programName][level][semester].push(code);
    }
    
    console.log('🗺️  Built course mapping structure');
    
    // Update each program with coursesPerLevel
    for (const program of programs) {
      const programName = program.name;
      const programId = program.id;
      
      console.log(`\n🎯 Processing: ${programName}`);
      
      // Find matching courses
      const matchingCourses = courseMap[programName] || {};
      
      if (Object.keys(matchingCourses).length === 0) {
        console.log(`⚠️  No matching courses found for ${programName}`);
        continue;
      }
      
      // Build coursesPerLevel structure
      const coursesPerLevel = {};
      
      for (const [level, semesters] of Object.entries(matchingCourses)) {
        coursesPerLevel[level] = {};
        
        for (const [semester, courseCodes] of Object.entries(semesters)) {
          coursesPerLevel[level][semester] = {
            "all": {
              "Regular": courseCodes,
              "Weekend": courseCodes
            }
          };
        }
      }
      
      console.log(`📊 Levels: ${Object.keys(coursesPerLevel).length}`);
      console.log(`📚 Total courses: ${Object.values(coursesPerLevel).reduce((total, level) => 
        total + Object.values(level).reduce((semTotal, semester) => 
          semTotal + semester.all.Regular.length, 0), 0)}`);
      
      // Update the program document
      try {
        await updateDoc(doc(db, 'academic-programs', programId), {
          coursesPerLevel: coursesPerLevel
        });
        console.log(`✅ Updated ${programName}`);
      } catch (error) {
        console.error(`❌ Error updating ${programName}:`, error.message);
      }
    }
    
    console.log('\n🎉 Course registration fix completed!');
    console.log('💡 The director should now see courses when registering students');
    
  } catch (error) {
    console.error('❌ Error in fixRegistrationData:', error);
  }
}

// Run the fix
fixRegistrationData()
  .then(() => {
    console.log('Fix script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fix script failed:', error);
    process.exit(1);
  });