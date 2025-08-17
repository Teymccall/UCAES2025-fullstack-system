const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, writeBatch } = require('firebase/firestore');

// Your project's Firebase configuration
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

// ESM Level 100 Semester 1 course codes from the curriculum
const esmLevel100Sem1Codes = [
  'ESM 151', 'ESM 153', 'ESM 155', 'ESM 161',
  'AGM 151', 'GNS 151', 'GNS 153', 'GNS 155'
];

// ESM Level 100 Semester 2 course codes from the curriculum
const esmLevel100Sem2Codes = [
  'ESM 152', 'ESM 154', 'ESM 156', 'ESM 158',
  'AGM 152', 'GNS 152', 'GNS 154', 'GNS 156'
];

async function fixESMCoursePrograms() {
  console.log("Fixing course program IDs for Environmental Science and Management...");

  try {
    // Get the program IDs
    const programsRef = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsRef);
    
    let esmProgramId = null;
    let agriProgramId = null;
    
    programsSnapshot.forEach(doc => {
      const programData = doc.data();
      if (programData.name && programData.name.includes("Environmental Science")) {
        esmProgramId = doc.id;
        console.log(`Found ESM program: "${programData.name}" with ID: ${esmProgramId}`);
      }
      if (programData.name && programData.name.includes("Sustainable Agriculture")) {
        agriProgramId = doc.id;
        console.log(`Found Agriculture program: "${programData.name}" with ID: ${agriProgramId}`);
      }
    });

    if (!esmProgramId) {
      console.log("Could not find the Environmental Science program ID.");
      return;
    }

    // Get all courses
    const coursesRef = collection(db, 'academic-courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    // Find ESM Level 100 Semester 1 courses with wrong program ID
    const coursesToFix = [];
    
    coursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      const courseCode = courseData.code || '';
      
      // Check if this is an ESM Level 100 Semester 1 course
      if (esmLevel100Sem1Codes.includes(courseCode) && courseData.programId !== esmProgramId) {
        coursesToFix.push({
          id: doc.id,
          code: courseCode,
          title: courseData.title || courseData.name || 'Untitled',
          currentProgramId: courseData.programId || 'NOT SET',
          level: courseData.level,
          semester: courseData.semester,
          type: 'Level 100 Semester 1'
        });
      }
      
      // Check if this is an ESM Level 100 Semester 2 course
      if (esmLevel100Sem2Codes.includes(courseCode) && courseData.programId !== esmProgramId) {
        coursesToFix.push({
          id: doc.id,
          code: courseCode,
          title: courseData.title || courseData.name || 'Untitled',
          currentProgramId: courseData.programId || 'NOT SET',
          level: courseData.level,
          semester: courseData.semester,
          type: 'Level 100 Semester 2'
        });
      }
    });
    
    console.log(`\nFound ${coursesToFix.length} ESM Level 100 courses with incorrect program IDs.`);
    
    if (coursesToFix.length > 0) {
      console.log("\nHere are the courses that need fixing:");
      coursesToFix.forEach(course => {
        console.log(`- ${course.code}: ${course.title} (Current programId: ${course.currentProgramId}, Type: ${course.type})`);
      });
      
      // Check if 'fix' argument was provided
      if (process.argv.includes('fix')) {
        console.log("\nUpdating courses with the correct program ID...");
        
        const batch = writeBatch(db);
        let updateCount = 0;
        
        for (const course of coursesToFix) {
          const courseRef = doc(db, 'academic-courses', course.id);
          
          // Update the program ID and ensure level and semester are correct
          const updateData = { 
            programId: esmProgramId 
          };
          
          // Set level to 100 if not already
          if (course.level !== 100) {
            updateData.level = 100;
          }
          
          // Set semester based on the course type
          if (course.type === 'Level 100 Semester 1' && course.semester !== 1) {
            updateData.semester = 1;
          } else if (course.type === 'Level 100 Semester 2' && course.semester !== 2) {
            updateData.semester = 2;
          }
          
          batch.update(courseRef, updateData);
          updateCount++;
        }
        
        // Commit the updates
        await batch.commit();
        console.log(`Successfully updated ${updateCount} courses.`);
      } else {
        console.log("\nTo fix these courses, run the script with the 'fix' argument.");
      }
    }
    
    // Now verify if all Level 100 Semester 1 courses exist with the correct program ID
    console.log("\nVerifying if all ESM Level 100 Semester 1 courses exist with correct program ID...");
    
    const missingCourses = [];
    
    for (const courseCode of esmLevel100Sem1Codes) {
      const courseQuery = query(
        coursesRef,
        where("code", "==", courseCode),
        where("programId", "==", esmProgramId),
        where("level", "==", 100),
        where("semester", "==", 1)
      );
      
      const courseSnapshot = await getDocs(courseQuery);
      
      if (courseSnapshot.empty) {
        missingCourses.push(courseCode);
      } else {
        console.log(`✓ Found ${courseCode}`);
      }
    }
    
    if (missingCourses.length > 0) {
      console.log(`\n⚠️ Missing ${missingCourses.length} courses for ESM Level 100 Semester 1:`);
      missingCourses.forEach(code => {
        console.log(`- ${code}`);
      });
    } else {
      console.log("\n✅ All ESM Level 100 Semester 1 courses exist with the correct program ID!");
    }

  } catch (error) {
    console.error("Error fixing course program IDs:", error);
  }
}

fixESMCoursePrograms(); 