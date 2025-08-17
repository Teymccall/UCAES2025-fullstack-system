// Script to check academic years and semesters in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkAcademicStructure() {
  console.log('Checking Firestore structure for academic years and semesters...\n');
  
  // Check academic years
  try {
    console.log('ACADEMIC YEARS:');
    console.log('==============');
    const yearsSnapshot = await getDocs(collection(db, 'academic-years'));
    
    if (yearsSnapshot.empty) {
      console.log('No academic years found in the database.');
    } else {
      console.log(`Found ${yearsSnapshot.size} academic year(s):`);
      
      yearsSnapshot.forEach(doc => {
        const year = doc.data();
        console.log(`\nID: ${doc.id}`);
        console.log(`Name: ${year.name || 'Not set'}`);
        console.log(`Start Date: ${year.startDate ? new Date(year.startDate.seconds * 1000).toLocaleDateString() : 'Not set'}`);
        console.log(`End Date: ${year.endDate ? new Date(year.endDate.seconds * 1000).toLocaleDateString() : 'Not set'}`);
        console.log(`Status: ${year.status || 'Not set'}`);
        console.log('-------------------');
      });
      
      // Check for active academic year
      const activeYearQuery = query(collection(db, 'academic-years'), where('status', '==', 'active'));
      const activeYearSnapshot = await getDocs(activeYearQuery);
      
      console.log(`\nActive academic years: ${activeYearSnapshot.size}`);
      if (activeYearSnapshot.size > 1) {
        console.log('WARNING: Multiple active academic years found. Only one should be active.');
      }
    }
  } catch (error) {
    console.error('Error checking academic years:', error);
  }
  
  // Check academic semesters
  try {
    console.log('\n\nACADEMIC SEMESTERS:');
    console.log('=================');
    const semestersSnapshot = await getDocs(collection(db, 'academic-semesters'));
    
    if (semestersSnapshot.empty) {
      console.log('No academic semesters found in the database.');
      console.log('You need to create a semesters collection.');
    } else {
      console.log(`Found ${semestersSnapshot.size} academic semester(s):`);
      
      semestersSnapshot.forEach(doc => {
        const semester = doc.data();
        console.log(`\nID: ${doc.id}`);
        console.log(`Name: ${semester.name || 'Not set'}`);
        console.log(`Academic Year ID: ${semester.academicYearId || 'Not set'}`);
        console.log(`Program Type: ${semester.programType || 'Not set'}`);
        console.log(`Start Date: ${semester.startDate ? new Date(semester.startDate.seconds * 1000).toLocaleDateString() : 'Not set'}`);
        console.log(`End Date: ${semester.endDate ? new Date(semester.endDate.seconds * 1000).toLocaleDateString() : 'Not set'}`);
        console.log(`Status: ${semester.status || 'Not set'}`);
        console.log('-------------------');
      });
      
      // Check for active semesters by program type
      const activeSemesterQuery = query(collection(db, 'academic-semesters'), where('status', '==', 'active'));
      const activeSemesterSnapshot = await getDocs(activeSemesterQuery);
      
      console.log(`\nTotal active semesters/trimesters: ${activeSemesterSnapshot.size}`);
      
      // Check active semesters by program type
      const regularActiveSemesters = [];
      const weekendActiveSemesters = [];
      
      activeSemesterSnapshot.forEach(doc => {
        const semester = doc.data();
        if (semester.programType === 'Regular') {
          regularActiveSemesters.push(doc.id);
        } else if (semester.programType === 'Weekend') {
          weekendActiveSemesters.push(doc.id);
        }
      });
      
      console.log(`Active Regular semesters: ${regularActiveSemesters.length}`);
      console.log(`Active Weekend trimesters: ${weekendActiveSemesters.length}`);
      
      if (regularActiveSemesters.length > 1) {
        console.log('WARNING: Multiple active Regular semesters found. Only one should be active.');
      }
      
      if (weekendActiveSemesters.length > 1) {
        console.log('WARNING: Multiple active Weekend trimesters found. Only one should be active.');
      }
    }
  } catch (error) {
    console.error('Error checking academic semesters:', error);
  }
  
  console.log('\n\nRECOMMENDATIONS:');
  console.log('===============');
  console.log('1. There should be only ONE academic year with status "active".');
  console.log('2. There should be only ONE semester with status "active" per program type (Regular/Weekend).');
  console.log('3. All academic years should have: id, name, startDate, endDate, status');
  console.log('4. All semesters should have: id, academicYearId, name, programType, startDate, endDate, status');
}

checkAcademicStructure(); 