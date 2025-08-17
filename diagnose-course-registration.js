/**
 * Course Registration Diagnostic Tool
 * This script helps diagnose why "no courses found" error occurs
 * when trying to register courses for students.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './Academic affairs/lib/firebase.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function diagnoseCourseRegistration() {
  console.log('🔍 COURSE REGISTRATION DIAGNOSTIC TOOL');
  console.log('=====================================\n');

  try {
    // 1. Check if academic-programs collection exists
    console.log('📋 CHECKING PROGRAMS...');
    const programsRef = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsRef);
    
    if (programsSnapshot.empty) {
      console.log('❌ No programs found in academic-programs collection');
      console.log('💡 SOLUTION: Run the seed-programs-courses.js script to populate programs');
      return;
    }

    console.log(`✅ Found ${programsSnapshot.size} programs:`);
    programsSnapshot.forEach(doc => {
      const program = doc.data();
      console.log(`   - ${doc.id}: ${program.name} (${program.code || 'No code'})`);
    });

    // 2. Check if academic-courses collection exists
    console.log('\n📚 CHECKING COURSES...');
    const coursesRef = collection(db, 'academic-courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    if (coursesSnapshot.empty) {
      console.log('❌ No courses found in academic-courses collection');
      console.log('💡 SOLUTION: Run the seed-programs-courses.js script to populate courses');
      return;
    }

    console.log(`✅ Found ${coursesSnapshot.size} courses total`);

    // 3. Check course distribution by program, level, and semester
    console.log('\n📊 COURSE DISTRIBUTION ANALYSIS');
    
    // Get all courses with their details
    const allCourses = [];
    coursesSnapshot.forEach(doc => {
      const course = doc.data();
      allCourses.push({
        id: doc.id,
        ...course,
        programId: course.programId || course.program || 'unknown',
        level: course.level || 0,
        semester: course.semester || 0,
        code: course.code || 'unknown',
        title: course.title || course.name || 'Unknown'
      });
    });

    // Group by program
    const byProgram = {};
    allCourses.forEach(course => {
      const program = course.programId;
      if (!byProgram[program]) byProgram[program] = [];
      byProgram[program].push(course);
    });

    console.log('\n📋 COURSES BY PROGRAM:');
    for (const [programId, courses] of Object.entries(byProgram)) {
      console.log(`\n   Program: ${programId} (${courses.length} courses)`);
      
      // Group by level and semester for this program
      const byLevelSemester = {};
      courses.forEach(course => {
        const key = `Level ${course.level}, Semester ${course.semester}`;
        if (!byLevelSemester[key]) byLevelSemester[key] = [];
        byLevelSemester[key].push(course);
      });

      // Show distribution
      Object.keys(byLevelSemester)
        .sort((a, b) => {
          const [levelA, semesterA] = a.match(/\d+/g).map(Number);
          const [levelB, semesterB] = b.match(/\d+/g).map(Number);
          return levelA - levelB || semesterA - semesterB;
        })
        .forEach(key => {
          const courseCount = byLevelSemester[key].length;
          const sampleCourses = byLevelSemester[key].slice(0, 3).map(c => c.code).join(', ');
          console.log(`      ${key}: ${courseCount} courses (${sampleCourses}${courseCount > 3 ? '...' : ''})`);
        });
    }

    // 4. Check for common issues
    console.log('\n🔍 ISSUE DETECTION');
    
    // Check for missing program references
    const programIds = new Set(programsSnapshot.docs.map(doc => doc.id));
    const courseProgramIds = new Set(allCourses.map(c => c.programId));
    
    const missingPrograms = [];
    courseProgramIds.forEach(programId => {
      if (!programIds.has(programId) && programId !== 'unknown') {
        missingPrograms.push(programId);
      }
    });

    if (missingPrograms.length > 0) {
      console.log(`❌ Courses reference missing programs: ${missingPrograms.join(', ')}`);
    }

    // Check for invalid level/semester values
    const invalidCourses = allCourses.filter(c => 
      !Number.isInteger(c.level) || c.level < 100 || c.level > 600 ||
      !Number.isInteger(c.semester) || c.semester < 1 || c.semester > 3
    );

    if (invalidCourses.length > 0) {
      console.log(`⚠️ Found ${invalidCourses.length} courses with invalid level/semester values`);
      invalidCourses.slice(0, 5).forEach(c => {
        console.log(`   - ${c.code}: Level ${c.level}, Semester ${c.semester}`);
      });
    }

    // 5. Provide specific recommendations
    console.log('\n💡 RECOMMENDATIONS');
    console.log('1. Ensure courses exist for the specific program/level/semester combination');
    console.log('2. Verify program IDs match between courses and programs');
    console.log('3. Check that level values are 100, 200, 300, 400, 500, 600');
    console.log('4. Check that semester values are 1, 2, or 3');
    console.log('5. Use the seed scripts to populate missing courses');

    // 6. Quick fix suggestions
    console.log('\n🛠️ QUICK FIXES');
    console.log('Run these scripts to fix common issues:');
    console.log('   - node Academic affairs/scripts/seed-programs-courses.js');
    console.log('   - node Academic affairs/scripts/verify-courses.js');
    console.log('   - node check-courses.js "Program Name"');

  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

// Run the diagnostic
console.log('Starting course registration diagnostic...\n');
diagnoseCourseRegistration()
  .then(() => console.log('\n✅ Diagnostic complete'))
  .catch(err => console.error('Diagnostic failed:', err))
  .finally(() => process.exit(0));