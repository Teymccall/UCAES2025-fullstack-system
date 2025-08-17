'use client';

import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  writeBatch,
  doc,
  query,
  where
} from 'firebase/firestore';
import { COLLEGE_PROGRAMS } from '../lib/programs-db';

/**
 * This script checks and migrates any mock data to Firebase
 * It should be run once to ensure all data is in Firebase and no mock data is used
 */
export async function migrateToFirebase() {
  console.log('Starting migration to Firebase...');
  
  try {
    // Migrate programs
    await migratePrograms();
    
    // Set up initial course structure
    await setupInitialCourses();
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

/**
 * Migrate program data to Firebase
 */
async function migratePrograms() {
  try {
    const programsCollection = collection(db, 'programs');
    const snapshot = await getDocs(programsCollection);
    
    if (snapshot.empty) {
      console.log('No programs found in database. Migrating from defined programs...');
      
      const batch = writeBatch(db);
      
      for (const program of COLLEGE_PROGRAMS) {
        const programRef = doc(programsCollection);
        const timestamp = serverTimestamp();
        
        batch.set(programRef, {
          ...program,
          id: programRef.id,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
      
      await batch.commit();
      console.log(`Migrated ${COLLEGE_PROGRAMS.length} programs to Firebase`);
    } else {
      console.log(`Found ${snapshot.size} existing programs in Firebase`);
    }
  } catch (error) {
    console.error('Error migrating programs:', error);
  }
}

/**
 * Set up initial course structure for each program
 */
async function setupInitialCourses() {
  try {
    const coursesCollection = collection(db, 'courses');
    const coursesSnapshot = await getDocs(coursesCollection);
    
    if (coursesSnapshot.empty) {
      console.log('No courses found. Setting up initial course structure...');
      
      // Define some initial courses for each program
      const initialCourses = [
        // Sustainable Agriculture courses
        {
          code: 'BSA101',
          name: 'Introduction to Sustainable Agriculture',
          description: 'Fundamentals of sustainable agricultural practices and principles',
          credits: 3,
          prerequisites: [],
          semester: '1',
          department: 'Agriculture',
          program: 'B.Sc. Sustainable Agriculture',
          level: '100',
          status: 'active'
        },
        {
          code: 'BSA102',
          name: 'Agricultural Ecology',
          description: 'Study of ecological principles in agricultural systems',
          credits: 3,
          prerequisites: [],
          semester: '1',
          department: 'Agriculture',
          program: 'B.Sc. Sustainable Agriculture',
          level: '100',
          status: 'active'
        },
        
        // Sustainable Forestry courses
        {
          code: 'BSF101',
          name: 'Introduction to Forestry',
          description: 'Principles and practices of sustainable forestry',
          credits: 3,
          prerequisites: [],
          semester: '1',
          department: 'Forestry',
          program: 'B.Sc. Sustainable Forestry',
          level: '100',
          status: 'active'
        },
        {
          code: 'BSF102',
          name: 'Forest Ecology',
          description: 'Study of forest ecosystems and their components',
          credits: 3,
          prerequisites: [],
          semester: '1',
          department: 'Forestry',
          program: 'B.Sc. Sustainable Forestry',
          level: '100',
          status: 'active'
        },
        
        // Environmental Science courses
        {
          code: 'BESM101',
          name: 'Introduction to Environmental Science',
          description: 'Basic concepts and principles of environmental science',
          credits: 3,
          prerequisites: [],
          semester: '1',
          department: 'Environmental Science',
          program: 'B.Sc. Environmental Science and Management',
          level: '100',
          status: 'active'
        },
        {
          code: 'BESM102',
          name: 'Environmental Management Principles',
          description: 'Fundamentals of environmental management and policy',
          credits: 3,
          prerequisites: [],
          semester: '1',
          department: 'Environmental Science',
          program: 'B.Sc. Environmental Science and Management',
          level: '100',
          status: 'active'
        }
      ];
      
      const batch = writeBatch(db);
      
      for (const course of initialCourses) {
        const courseRef = doc(coursesCollection);
        const timestamp = serverTimestamp();
        
        batch.set(courseRef, {
          ...course,
          id: courseRef.id,
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
      
      await batch.commit();
      console.log(`Added ${initialCourses.length} initial courses to Firebase`);
      
      // Now link courses to programs
      await linkCoursesToPrograms(initialCourses);
    } else {
      console.log(`Found ${coursesSnapshot.size} existing courses in Firebase`);
    }
  } catch (error) {
    console.error('Error setting up initial courses:', error);
  }
}

/**
 * Link courses to their respective programs
 */
async function linkCoursesToPrograms(courses: any[]) {
  try {
    const programsCollection = collection(db, 'programs');
    const programsQuery = query(programsCollection, where('status', '==', 'Active'));
    const programsSnapshot = await getDocs(programsQuery);
    
    if (programsSnapshot.empty) {
      console.log('No active programs found to link courses to');
      return;
    }
    
    const batch = writeBatch(db);
    
    for (const programDoc of programsSnapshot.docs) {
      const program = { id: programDoc.id, ...programDoc.data() };
      const programCourses = courses.filter(course => course.program === program.name);
      
      if (programCourses.length === 0) continue;
      
      // Update program with courses
      const coursesPerLevel = program.coursesPerLevel || {};
      
      programCourses.forEach(course => {
        if (!coursesPerLevel[course.level]) {
          coursesPerLevel[course.level] = {};
        }
        
        if (!coursesPerLevel[course.level][course.semester]) {
          coursesPerLevel[course.level][course.semester] = [];
        }
        
        if (!coursesPerLevel[course.level][course.semester].includes(course.code)) {
          coursesPerLevel[course.level][course.semester].push(course.code);
        }
      });
      
      // Update the program document with the updated coursesPerLevel
      const programRef = doc(programsCollection, program.id);
      batch.update(programRef, { 
        coursesPerLevel,
        updatedAt: serverTimestamp()
      });
    }
    
    await batch.commit();
    console.log('Successfully linked courses to programs');
  } catch (error) {
    console.error('Error linking courses to programs:', error);
  }
}

// Run the migration if this script is executed directly
if (typeof window !== 'undefined') {
  console.log('Migration script loaded. You can run it by calling migrateToFirebase() in the console.');
}

export default migrateToFirebase; 