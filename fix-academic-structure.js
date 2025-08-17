// Script to fix academic years and semesters structure in Firestore
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, 
  query, where, Timestamp, deleteDoc, addDoc 
} = require('firebase/firestore');

// Import Firebase config
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

// Helper to convert date string to Timestamp
function toTimestamp(dateString) {
  const date = new Date(dateString);
  return Timestamp.fromDate(date);
}

async function fixAcademicStructure() {
  console.log('Fixing Firestore structure for academic years and semesters...\n');
  
  // Step 1: Fix academic years
  try {
    console.log('FIXING ACADEMIC YEARS:');
    console.log('====================');
    
    const yearsRef = collection(db, 'academic-years');
    const yearsSnapshot = await getDocs(yearsRef);
    
    // Deactivate all academic years first
    for (const yearDoc of yearsSnapshot.docs) {
      await updateDoc(doc(db, 'academic-years', yearDoc.id), {
        status: 'inactive'
      });
      console.log(`Set academic year ${yearDoc.id} to inactive`);
    }
    
    // Find or create the 2024/2025 academic year
    const year2024Query = query(
      collection(db, 'academic-years'),
      where('name', '==', '2024/2025')
    );
    const year2024Snapshot = await getDocs(year2024Query);
    
    let year2024Id;
    
    if (year2024Snapshot.empty) {
      // Create the 2024/2025 academic year
      const newYearRef = await addDoc(collection(db, 'academic-years'), {
        name: '2024/2025',
        startDate: toTimestamp('2024-09-01'),
        endDate: toTimestamp('2025-08-31'),
        status: 'active',
        admissionOpen: toTimestamp('2024-05-01'),
        admissionClose: toTimestamp('2024-08-31')
      });
      year2024Id = newYearRef.id;
      console.log(`Created new academic year 2024/2025 with ID: ${year2024Id}`);
    } else {
      // Update the existing 2024/2025 academic year
      year2024Id = year2024Snapshot.docs[0].id;
      await updateDoc(doc(db, 'academic-years', year2024Id), {
        name: '2024/2025',
        startDate: toTimestamp('2024-09-01'),
        endDate: toTimestamp('2025-08-31'),
        status: 'active',
        admissionOpen: toTimestamp('2024-05-01'),
        admissionClose: toTimestamp('2024-08-31')
      });
      console.log(`Updated academic year 2024/2025 with ID: ${year2024Id}`);
    }
    
    // After the section where we create or update the 2024/2025 academic year
    // Update the academic year with more clear definitions for Regular and Weekend programs
    const academicYearData = {
      name: '2024/2025',
      startDate: toTimestamp('2024-09-01'),
      endDate: toTimestamp('2025-08-31'),
      status: 'active',
      admissionOpen: toTimestamp('2024-05-01'),
      admissionClose: toTimestamp('2024-08-31'),
      regularProgram: {
        semesters: [
          {
            name: 'First Semester',
            startDate: '2024-09-01',
            endDate: '2024-12-20'
          },
          {
            name: 'Second Semester',
            startDate: '2025-02-01',
            endDate: '2025-05-20'
          }
        ]
      },
      weekendProgram: {
        trimesters: [
          {
            name: 'First Trimester',
            startDate: '2024-10-01',
            endDate: '2024-12-20'
          },
          {
            name: 'Second Trimester',
            startDate: '2025-02-01',
            endDate: '2025-05-20'
          },
          {
            name: 'Third Trimester',
            startDate: '2025-06-01',
            endDate: '2025-08-20'
          }
        ]
      }
    };
    
    // Step 2: Fix academic semesters
    console.log('\nFIXING ACADEMIC SEMESTERS:');
    console.log('========================');
    
    const semestersRef = collection(db, 'academic-semesters');
    const semestersSnapshot = await getDocs(semestersRef);
    
    // Deactivate all semesters first
    for (const semesterDoc of semestersSnapshot.docs) {
      await updateDoc(doc(db, 'academic-semesters', semesterDoc.id), {
        status: 'inactive'
      });
      console.log(`Set semester ${semesterDoc.id} to inactive`);
    }
    
    // Create or update Regular Program semesters
    const regularFirstSemName = 'First Semester';
    const regularFirstSemQuery = query(
      collection(db, 'academic-semesters'),
      where('name', '==', regularFirstSemName),
      where('academicYearId', '==', year2024Id),
      where('programType', '==', 'Regular')
    );
    const regularFirstSemSnapshot = await getDocs(regularFirstSemQuery);
    
    if (regularFirstSemSnapshot.empty) {
      // Create First Semester for Regular program
      const newSemesterRef = await addDoc(collection(db, 'academic-semesters'), {
        name: regularFirstSemName,
        academicYearId: year2024Id,
        programType: 'Regular',
        startDate: toTimestamp('2024-09-01'),
        endDate: toTimestamp('2024-12-20'),
        status: 'active'
      });
      console.log(`Created Regular First Semester with ID: ${newSemesterRef.id}`);
    } else {
      // Update existing First Semester
      const semId = regularFirstSemSnapshot.docs[0].id;
      await updateDoc(doc(db, 'academic-semesters', semId), {
        name: regularFirstSemName,
        academicYearId: year2024Id,
        programType: 'Regular',
        startDate: toTimestamp('2024-09-01'),
        endDate: toTimestamp('2024-12-20'),
        status: 'active'
      });
      console.log(`Updated Regular First Semester with ID: ${semId}`);
    }
    
    const regularSecondSemName = 'Second Semester';
    const regularSecondSemQuery = query(
      collection(db, 'academic-semesters'),
      where('name', '==', regularSecondSemName),
      where('academicYearId', '==', year2024Id),
      where('programType', '==', 'Regular')
    );
    const regularSecondSemSnapshot = await getDocs(regularSecondSemQuery);
    
    if (regularSecondSemSnapshot.empty) {
      // Create Second Semester for Regular program
      const newSemesterRef = await addDoc(collection(db, 'academic-semesters'), {
        name: regularSecondSemName,
        academicYearId: year2024Id,
        programType: 'Regular',
        startDate: toTimestamp('2025-02-01'),
        endDate: toTimestamp('2025-05-20'),
        status: 'upcoming'
      });
      console.log(`Created Regular Second Semester with ID: ${newSemesterRef.id}`);
    } else {
      // Update existing Second Semester
      const semId = regularSecondSemSnapshot.docs[0].id;
      await updateDoc(doc(db, 'academic-semesters', semId), {
        name: regularSecondSemName,
        academicYearId: year2024Id,
        programType: 'Regular',
        startDate: toTimestamp('2025-02-01'),
        endDate: toTimestamp('2025-05-20'),
        status: 'upcoming'
      });
      console.log(`Updated Regular Second Semester with ID: ${semId}`);
    }
    
    // Create or update Weekend Program trimesters
    const weekendTerms = [
      {
        name: 'First Trimester',
        startDate: '2024-10-01',
        endDate: '2024-12-20',
        status: 'active'
      },
      {
        name: 'Second Trimester',
        startDate: '2025-02-01',
        endDate: '2025-05-20',
        status: 'upcoming'
      },
      {
        name: 'Third Trimester',
        startDate: '2025-06-01',
        endDate: '2025-08-20',
        status: 'upcoming'
      }
    ];
    
    for (const term of weekendTerms) {
      const termQuery = query(
        collection(db, 'academic-semesters'),
        where('name', '==', term.name),
        where('academicYearId', '==', year2024Id),
        where('programType', '==', 'Weekend')
      );
      const termSnapshot = await getDocs(termQuery);
      
      if (termSnapshot.empty) {
        // Create new trimester
        const newTermRef = await addDoc(collection(db, 'academic-semesters'), {
          name: term.name,
          academicYearId: year2024Id,
          programType: 'Weekend',
          startDate: toTimestamp(term.startDate),
          endDate: toTimestamp(term.endDate),
          status: term.status
        });
        console.log(`Created Weekend ${term.name} with ID: ${newTermRef.id}`);
      } else {
        // Update existing trimester
        const termId = termSnapshot.docs[0].id;
        await updateDoc(doc(db, 'academic-semesters', termId), {
          name: term.name,
          academicYearId: year2024Id,
          programType: 'Weekend',
          startDate: toTimestamp(term.startDate),
          endDate: toTimestamp(term.endDate),
          status: term.status
        });
        console.log(`Updated Weekend ${term.name} with ID: ${termId}`);
      }
    }
    
    console.log('\nAcademic years and semesters fixed successfully!');
    console.log('\nActive Academic Year: 2024/2025');
    console.log('Active Regular Semester: First Semester');
    console.log('Active Weekend Trimester: First Trimester');
    
  } catch (error) {
    console.error('Error fixing academic structure:', error);
  }
}

fixAcademicStructure(); 