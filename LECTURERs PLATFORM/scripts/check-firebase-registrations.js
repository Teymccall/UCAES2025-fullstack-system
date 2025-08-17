const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirebaseRegistrations() {
  try {
    console.log('🔍 Checking Firebase course-registrations collection...');
    
    const registrationsRef = collection(db, 'course-registrations');
    const snapshot = await getDocs(registrationsRef);
    
    console.log(`📊 Found ${snapshot.size} registrations in course-registrations collection`);
    
    if (snapshot.empty) {
      console.log('❌ No registrations found in course-registrations collection');
      return;
    }
    
    console.log('\n📋 All Registrations:');
    console.log('='.repeat(80));
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Registration ${index + 1} (ID: ${doc.id}):`);
      console.log('  Student ID:', data.studentId);
      console.log('  Student Name:', data.studentName);
      console.log('  Registration Number:', data.registrationNumber);
      console.log('  Email:', data.email);
      console.log('  Academic Year:', data.academicYear);
      console.log('  Semester:', data.semester);
      console.log('  Level:', data.level);
      console.log('  Program:', data.program);
      console.log('  Study Mode:', data.studyMode);
      console.log('  Status:', data.status);
      console.log('  Total Credits:', data.totalCredits);
      console.log('  Registration Date:', data.registrationDate);
      console.log('  Registered By:', data.registeredBy);
      
      if (data.courses && Array.isArray(data.courses)) {
        console.log('  Courses:');
        data.courses.forEach((course, courseIndex) => {
          console.log(`    ${courseIndex + 1}. ${course.courseCode} - ${course.courseName} (${course.credits} credits)`);
        });
      } else {
        console.log('  Courses: No courses array found');
      }
      console.log('-'.repeat(40));
    });
    
    // Check for specific students mentioned in the image
    console.log('\n🎯 Looking for specific students:');
    console.log('='.repeat(50));
    
    const targetStudents = [
      'UCAES20256921', // JOHNSON BRIGHT
      'pacmboro@outlook.com',
      '10288633@upsamail.edu.gh'
    ];
    
    targetStudents.forEach(target => {
      const found = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.registrationNumber === target || 
               data.studentId === target || 
               data.email === target;
      });
      
      if (found) {
        const data = found.data();
        console.log(`✅ Found student: ${data.studentName} (${data.registrationNumber})`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Year: ${data.academicYear}, Semester: ${data.semester}`);
        console.log(`   Courses: ${data.courses?.length || 0} courses`);
      } else {
        console.log(`❌ Not found: ${target}`);
      }
    });
    
    // Check for ESM 161 registrations specifically
    console.log('\n🔍 Checking for ESM 161 registrations:');
    console.log('='.repeat(50));
    
    const esm161Registrations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        const hasESM161 = data.courses.some(course => 
          course.courseCode === 'ESM 161' || 
          course.courseName?.includes('Principles of Management')
        );
        
        if (hasESM161) {
          esm161Registrations.push({ id: doc.id, ...data });
        }
      }
    });
    
    console.log(`📊 Found ${esm161Registrations.length} ESM 161 registrations:`);
    esm161Registrations.forEach((reg, index) => {
      console.log(`\n${index + 1}. ${reg.studentName} (${reg.registrationNumber})`);
      console.log(`   Email: ${reg.email}`);
      console.log(`   Year: ${reg.academicYear}, Semester: ${reg.semester}`);
      console.log(`   Status: ${reg.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking Firebase registrations:', error);
  }
}

checkFirebaseRegistrations(); 