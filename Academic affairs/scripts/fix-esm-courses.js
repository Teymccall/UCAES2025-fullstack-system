const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, updateDoc, writeBatch } = require('firebase/firestore');

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

async function checkAndFixESMCourses() {
  console.log("Checking and fixing ESM courses...");

  try {
    // Get the program ID for Environmental Science
    const programsRef = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsRef);
    
    let esmProgramId = null;
    programsSnapshot.forEach(doc => {
      const programData = doc.data();
      if (programData.name && programData.name.includes("Environmental Science")) {
        esmProgramId = doc.id;
        console.log(`Found ESM program: "${programData.name}" with ID: ${esmProgramId}`);
      }
    });

    if (!esmProgramId) {
      console.log("Could not find the Environmental Science program ID.");
      return;
    }

    // Now check for ESM courses with course code starting with ESM
    const coursesRef = collection(db, 'academic-courses');
    const q = query(coursesRef);
    const coursesSnapshot = await getDocs(q);
    
    console.log(`Found ${coursesSnapshot.size} total courses in the database.`);
    
    // Count courses by prefix
    const coursesByPrefix = {};
    const esmCoursesWithoutProgramId = [];
    
    coursesSnapshot.forEach(doc => {
      const courseData = doc.data();
      const courseCode = courseData.code || '';
      const prefix = courseCode.split(' ')[0] || 'UNKNOWN';
      
      if (!coursesByPrefix[prefix]) {
        coursesByPrefix[prefix] = 0;
      }
      coursesByPrefix[prefix]++;
      
      // Check if this is an ESM course without the correct program ID
      if (prefix === 'ESM' && courseData.programId !== esmProgramId) {
        esmCoursesWithoutProgramId.push({
          id: doc.id,
          code: courseCode,
          title: courseData.title || courseData.name || 'Untitled',
          currentProgramId: courseData.programId || 'NOT SET'
        });
      }
    });
    
    console.log("\nCourses by prefix:");
    Object.entries(coursesByPrefix)
      .sort((a, b) => b[1] - a[1])
      .forEach(([prefix, count]) => {
        console.log(`${prefix}: ${count} courses`);
      });
    
    console.log(`\nFound ${esmCoursesWithoutProgramId.length} ESM courses without the correct program ID.`);
    
    if (esmCoursesWithoutProgramId.length > 0) {
      console.log("\nHere are the first 10 ESM courses with incorrect program IDs:");
      esmCoursesWithoutProgramId.slice(0, 10).forEach(course => {
        console.log(`- ${course.code}: ${course.title} (Current programId: ${course.currentProgramId})`);
      });
      
      // Ask if we should fix these courses
      console.log("\nWould you like to fix these courses? (Run the script with 'fix' argument to update them)");
      
      // Check if 'fix' argument was provided
      if (process.argv.includes('fix')) {
        console.log("\nUpdating ESM courses with the correct program ID...");
        
        const batch = writeBatch(db);
        let updateCount = 0;
        
        for (const course of esmCoursesWithoutProgramId) {
          const courseRef = doc(db, 'academic-courses', course.id);
          batch.update(courseRef, { programId: esmProgramId });
          updateCount++;
          
          // Firestore batches have a limit of 500 operations
          if (updateCount % 450 === 0) {
            await batch.commit();
            console.log(`Committed batch of ${updateCount} updates.`);
            // Create a new batch
            batch = writeBatch(db);
          }
        }
        
        // Commit any remaining updates
        if (updateCount % 450 !== 0) {
          await batch.commit();
        }
        
        console.log(`Successfully updated ${updateCount} ESM courses with the correct program ID.`);
      }
    }
    
    // Check if there are any Level 100, Semester 1 ESM courses with the correct program ID
    const level100Query = query(
      coursesRef,
      where("programId", "==", esmProgramId),
      where("level", "==", 100),
      where("semester", "==", 1)
    );
    
    const level100Snapshot = await getDocs(level100Query);
    console.log(`\nFound ${level100Snapshot.size} Level 100, Semester 1 ESM courses with the correct program ID.`);
    
    if (level100Snapshot.size > 0) {
      console.log("\nHere are the first 5 courses:");
      level100Snapshot.docs.slice(0, 5).forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.code}: ${data.title || data.name} (programId: ${data.programId})`);
      });
    }

  } catch (error) {
    console.error("Error checking and fixing ESM courses:", error);
  }
}

checkAndFixESMCourses(); 