/**
 * Quick Fix Script for Missing Courses
 * Populates basic courses for common program/level/semester combinations
 * This addresses the "no courses found" error in course registration
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { firebaseConfig } from './Academic affairs/lib/firebase.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Common course templates for different programs
const courseTemplates = {
  "BSc. Environmental Science and Management": {
    100: {
      1: [
        { code: "ESM 101", title: "Introduction to Environmental Science", credits: 3 },
        { code: "ESM 103", title: "Principles of Biology", credits: 3 },
        { code: "ESM 105", title: "Chemistry for Environmental Scientists", credits: 3 },
        { code: "ESM 107", title: "Mathematics for Environmental Science", credits: 3 },
        { code: "ESM 109", title: "Introduction to Computer Applications", credits: 2 }
      ],
      2: [
        { code: "ESM 102", title: "Environmental Systems", credits: 3 },
        { code: "ESM 104", title: "Ecology Fundamentals", credits: 3 },
        { code: "ESM 106", title: "Physics for Environmental Science", credits: 3 },
        { code: "ESM 108", title: "Statistics for Environmental Science", credits: 3 },
        { code: "ESM 110", title: "Communication Skills", credits: 2 }
      ]
    },
    200: {
      1: [
        { code: "ESM 201", title: "Environmental Chemistry", credits: 3 },
        { code: "ESM 203", title: "Microbiology", credits: 3 },
        { code: "ESM 205", title: "Soil Science", credits: 3 },
        { code: "ESM 207", title: "Introduction to GIS", credits: 3 },
        { code: "ESM 209", title: "Environmental Policy and Law", credits: 2 }
      ],
      2: [
        { code: "ESM 202", title: "Water Quality Management", credits: 3 },
        { code: "ESM 204", title: "Air Pollution Control", credits: 3 },
        { code: "ESM 206", title: "Waste Management", credits: 3 },
        { code: "ESM 208", title: "Environmental Impact Assessment", credits: 3 },
        { code: "ESM 210", title: "Research Methods", credits: 2 }
      ]
    }
  },
  "BSc. Aquaculture and Water Resources Management": {
    100: {
      1: [
        { code: "AQS 101", title: "Introduction to Aquaculture", credits: 3 },
        { code: "AQS 103", title: "Principles of Biology", credits: 3 },
        { code: "AQS 105", title: "Chemistry for Aquaculture", credits: 3 },
        { code: "AQS 107", title: "Mathematics for Aquaculture", credits: 3 },
        { code: "AQS 109", title: "Introduction to Computer Applications", credits: 2 }
      ],
      2: [
        { code: "AQS 102", title: "Aquatic Systems", credits: 3 },
        { code: "AQS 104", title: "Fish Biology", credits: 3 },
        { code: "AQS 106", title: "Water Chemistry", credits: 3 },
        { code: "AQS 108", title: "Statistics for Aquaculture", credits: 3 },
        { code: "AQS 110", title: "Communication Skills", credits: 2 }
      ]
    }
  }
};

async function fixMissingCourses() {
  console.log('🔧 FIXING MISSING COURSES');
  console.log('============================\n');

  try {
    // 1. Get all programs
    const programsRef = collection(db, 'academic-programs');
    const programsSnapshot = await getDocs(programsRef);
    
    if (programsSnapshot.empty) {
      console.log('❌ No programs found. Please run seed-programs-courses.js first.');
      return;
    }

    const programs = {};
    programsSnapshot.forEach(doc => {
      const program = doc.data();
      programs[program.name] = doc.id;
    });

    console.log('📋 Available programs:');
    Object.keys(programs).forEach(name => {
      console.log(`   - ${name}: ${programs[name]}`);
    });

    let totalAdded = 0;

    // 2. Add missing courses for each program
    for (const [programName, levels] of Object.entries(courseTemplates)) {
      const programId = programs[programName];
      
      if (!programId) {
        console.log(`⚠️ Program "${programName}" not found in database`);
        continue;
      }

      console.log(`\n🎯 Processing ${programName}...`);

      for (const [levelNum, semesters] of Object.entries(levels)) {
        for (const [semesterNum, courses] of Object.entries(semesters)) {
          
          // Check if courses already exist for this program/level/semester
          const coursesRef = collection(db, 'academic-courses');
          const existingQuery = query(
            coursesRef,
            where('programId', '==', programId),
            where('level', '==', parseInt(levelNum)),
            where('semester', '==', parseInt(semesterNum))
          );
          
          const existingSnapshot = await getDocs(existingQuery);
          const existingCount = existingSnapshot.size;
          
          if (existingCount > 0) {
            console.log(`   ✅ Level ${levelNum}, Semester ${semesterNum}: ${existingCount} courses already exist`);
            continue;
          }

          console.log(`   📝 Adding ${courses.length} courses for Level ${levelNum}, Semester ${semesterNum}...`);

          // Add missing courses
          for (const course of courses) {
            try {
              const courseData = {
                code: course.code,
                title: course.title,
                name: course.title,
                description: `${course.title} - ${course.credits} credit hours`,
                credits: course.credits,
                level: parseInt(levelNum),
                semester: parseInt(semesterNum),
                programId: programId,
                program: programName,
                department: programName.includes('Environmental') ? 'Environmental Science' : 'Aquaculture',
                status: 'active',
                theory: Math.ceil(course.credits * 0.7),
                practical: Math.floor(course.credits * 0.3),
                prerequisites: [],
                studyMode: 'Regular',
                createdAt: new Date()
              };

              await addDoc(collection(db, 'academic-courses'), courseData);
              console.log(`      ✓ Added ${course.code}: ${course.title}`);
              totalAdded++;
            } catch (error) {
              console.error(`      ❌ Error adding ${course.code}:`, error.message);
            }
          }
        }
      }
    }

    console.log(`\n✅ Fix complete! Added ${totalAdded} new courses.`);
    
    if (totalAdded > 0) {
      console.log('\n🔄 Next steps:');
      console.log('1. Refresh the course registration page');
      console.log('2. Select a student and try registering courses again');
      console.log('3. Courses should now appear for the populated program/level/semester combinations');
    } else {
      console.log('\nℹ️ All courses already exist. The issue might be elsewhere.');
    }

  } catch (error) {
    console.error('❌ Error fixing courses:', error);
  }
}

// Run the fix
console.log('Starting course fix...\n');
fixMissingCourses()
  .then(() => console.log('\n✅ Fix process complete'))
  .catch(err => console.error('Fix failed:', err))
  .finally(() => process.exit(0));