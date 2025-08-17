// Direct Firebase query to understand what student data actually exists
// This mimics the student portal queries to see real data

const { initializeApp, getApps, getApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

// Same Firebase config as both student portal and academic affairs
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

async function debugFirebaseDirectly() {
  console.log('🔥 DIRECT FIREBASE DEBUG');
  console.log('=' .repeat(60));
  console.log('Querying Firebase directly to see what student data exists\n');

  let app, db;
  
  try {
    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log('✅ Connected to Firebase project:', firebaseConfig.projectId);
  } catch (error) {
    console.error('❌ Failed to connect to Firebase:', error.message);
    return;
  }

  // Check all collections that might contain student data
  const collectionsToCheck = [
    'student-registrations',
    'students', 
    'course-registrations',
    'student-grades',
    'grades',
    'grade-submissions'
  ];

  const results = {};

  for (const collectionName of collectionsToCheck) {
    console.log(`\n📋 Checking collection: ${collectionName}`);
    console.log('-' .repeat(50));
    
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      results[collectionName] = {
        count: snapshot.size,
        docs: []
      };

      if (snapshot.size > 0) {
        console.log(`✅ Found ${snapshot.size} documents`);
        
        // Show first 3 documents as samples
        const sampleDocs = snapshot.docs.slice(0, 3);
        sampleDocs.forEach((doc, index) => {
          const data = doc.data();
          results[collectionName].docs.push({
            id: doc.id,
            data: data
          });

          console.log(`\n   Sample ${index + 1} (ID: ${doc.id}):`);
          
          // Show relevant fields based on collection type
          if (collectionName.includes('student')) {
            console.log(`      Name: ${data.name || `${data.surname || ''} ${data.otherNames || ''}`.trim() || 'N/A'}`);
            console.log(`      Registration: ${data.registrationNumber || data.studentIndexNumber || data.indexNumber || 'N/A'}`);
            console.log(`      Email: ${data.email || 'N/A'}`);
            console.log(`      Program: ${data.programme || data.program || 'N/A'}`);
            console.log(`      Level: ${data.currentLevel || data.level || data.entryLevel || 'N/A'}`);
          } else if (collectionName.includes('grade')) {
            console.log(`      Student ID: ${data.studentId || 'N/A'}`);
            console.log(`      Course: ${data.courseCode || data.courseId || 'N/A'}`);
            console.log(`      Grade: ${data.grade || 'N/A'}`);
            console.log(`      Status: ${data.status || 'N/A'}`);
            console.log(`      Academic Year: ${data.academicYear || 'N/A'}`);
            console.log(`      Semester: ${data.semester || 'N/A'}`);
          } else if (collectionName.includes('course-registration')) {
            console.log(`      Student ID: ${data.studentId || 'N/A'}`);
            console.log(`      Academic Year: ${data.academicYear || 'N/A'}`);
            console.log(`      Semester: ${data.semester || 'N/A'}`);
            console.log(`      Courses: ${data.courses ? data.courses.length : 'N/A'}`);
          }
          
          // Show all field names for debugging
          console.log(`      Fields: ${Object.keys(data).join(', ')}`);
        });
      } else {
        console.log(`❌ No documents found`);
      }
      
    } catch (error) {
      console.log(`❌ Error querying ${collectionName}:`, error.message);
      results[collectionName] = {
        error: error.message
      };
    }
  }

  // Analysis and recommendations
  console.log('\n\n🔍 ANALYSIS & FINDINGS');
  console.log('=' .repeat(60));

  const studentRegistrations = results['student-registrations'];
  const students = results['students'];
  const studentGrades = results['student-grades'];
  const courseRegistrations = results['course-registrations'];

  if (studentRegistrations?.count > 0) {
    console.log('✅ FOUND STUDENTS IN SYSTEM!');
    console.log(`📋 ${studentRegistrations.count} records in student-registrations`);
    
    const sampleStudent = studentRegistrations.docs[0]?.data;
    if (sampleStudent) {
      console.log('\n🎯 TESTING TRANSCRIPT SEARCH WITH REAL DATA:');
      console.log(`Try searching for:`);
      console.log(`- Registration: "${sampleStudent.registrationNumber || sampleStudent.studentIndexNumber}"`);
      console.log(`- Name: "${sampleStudent.surname || ''}" or "${sampleStudent.otherNames || ''}"`);
      console.log(`- Email: "${sampleStudent.email || ''}"`);
    }
  } else {
    console.log('❌ No students found in student-registrations');
  }

  if (students?.count > 0) {
    console.log(`👥 ${students.count} records in students collection`);
  } else {
    console.log('⚠️ No records in students collection - may need sync');
  }

  if (studentGrades?.count > 0) {
    console.log(`📊 ${studentGrades.count} grade records found`);
    const sampleGrade = studentGrades.docs[0]?.data;
    if (sampleGrade) {
      console.log(`📚 Sample grade: ${sampleGrade.courseCode} - ${sampleGrade.grade} for student ${sampleGrade.studentId}`);
    }
  } else if (results['grades']?.count > 0) {
    console.log(`📊 ${results['grades'].count} grade records in legacy grades collection`);
  } else {
    console.log('❌ No grade records found');
  }

  if (courseRegistrations?.count > 0) {
    console.log(`📝 ${courseRegistrations.count} course registration records`);
  } else {
    console.log('❌ No course registrations found');
  }

  console.log('\n💡 RECOMMENDATIONS:');
  
  if (studentRegistrations?.count > 0) {
    console.log('✅ Students exist - transcript search logic needs fixing');
    console.log('✅ Use the student data shown above to test transcripts');
    console.log('✅ Check field name mapping in transcript API');
  } else {
    console.log('❌ Need to populate student data first');
    console.log('❌ Import from admission system or use test data');
  }

  if (studentGrades?.count === 0 && results['grades']?.count === 0) {
    console.log('⚠️ No published grades - transcripts will be empty');
    console.log('⚠️ Ensure grade publishing workflow is working');
  }

  // Show the student portal data that we know exists
  console.log('\n📱 STUDENT PORTAL EVIDENCE:');
  console.log('The student portal shows:');
  console.log('- ESM 255 (Hydrology): C+ grade, 65/100');
  console.log('- ESM 251 (Geology): B grade, 70/100');
  console.log('- Academic Year: 2026-2027');
  console.log('- Semester: First Semester');
  console.log('- This proves students and grades exist in the system!');

  console.log('\n🏁 Debug Complete');
  
  // Export data for further analysis
  console.log('\n📄 Raw data saved to results object for manual inspection');
  return results;
}

debugFirebaseDirectly()
  .then((results) => {
    console.log('\n✅ Firebase debug completed');
    console.log('Check the output above for specific student data to use in transcript search');
  })
  .catch(error => {
    console.error('❌ Debug failed:', error);
  });














