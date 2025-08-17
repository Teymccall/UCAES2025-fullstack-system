const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkCourseRegistrations() {
  try {
    console.log('🔍 Checking course-registrations collection...');
    
    const registrationsRef = collection(db, 'course-registrations');
    const snapshot = await getDocs(registrationsRef);
    
    console.log(`📊 Found ${snapshot.size} registrations in course-registrations collection`);
    
    if (snapshot.empty) {
      console.log('❌ No registrations found in course-registrations collection');
      return;
    }
    
    console.log('\n📋 Registration Details:');
    console.log('='.repeat(80));
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n📄 Registration ${index + 1} (ID: ${doc.id}):`);
      console.log('  Academic Year:', data.academicYear);
      console.log('  Semester:', data.semester);
      console.log('  Student ID:', data.studentId);
      console.log('  Registration Number:', data.registrationNumber);
      console.log('  Courses:', JSON.stringify(data.courses, null, 2));
      console.log('  Program:', data.program);
      console.log('  Level:', data.level);
      console.log('  Status:', data.status);
      console.log('  Registration Date:', data.registrationDate);
      console.log('-'.repeat(40));
    });
    
    // Check for specific course
    console.log('\n🔍 Looking for AGM 151 registrations...');
    const agmRegistrations = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        const hasAGM151 = data.courses.some(course => {
          if (typeof course === 'string') {
            return course.includes('AGM 151') || course.includes('AGM151');
          }
          return (course.courseCode && course.courseCode.includes('AGM 151')) ||
                 (course.code && course.code.includes('AGM 151')) ||
                 (course.title && course.title.includes('AGM 151'));
        });
        
        if (hasAGM151) {
          agmRegistrations.push({ id: doc.id, ...data });
        }
      }
    });
    
    console.log(`\n✅ Found ${agmRegistrations.length} registrations with AGM 151:`);
    agmRegistrations.forEach((reg, index) => {
      console.log(`\n📄 AGM 151 Registration ${index + 1}:`);
      console.log('  ID:', reg.id);
      console.log('  Academic Year:', reg.academicYear);
      console.log('  Semester:', reg.semester);
      console.log('  Student ID:', reg.studentId);
      console.log('  Registration Number:', reg.registrationNumber);
      console.log('  Courses:', JSON.stringify(reg.courses, null, 2));
    });
    
  } catch (error) {
    console.error('❌ Error checking registrations:', error);
  }
}

checkCourseRegistrations(); 