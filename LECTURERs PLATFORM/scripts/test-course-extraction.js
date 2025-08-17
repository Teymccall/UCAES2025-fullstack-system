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

async function testCourseExtraction() {
  try {
    console.log('🧪 Testing Course Code Extraction...');
    console.log('='.repeat(50));
    
    // 1. Check academic courses collection
    console.log('\n📚 1. Academic Courses Collection:');
    console.log('-'.repeat(30));
    
    const coursesRef = collection(db, 'academic-courses');
    const coursesSnapshot = await getDocs(coursesRef);
    
    console.log(`Found ${coursesSnapshot.size} academic courses:`);
    coursesSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Course ID: ${doc.id}`);
      console.log(`   Code: ${data.code || 'N/A'}`);
      console.log(`   Title: ${data.title || 'N/A'}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      
      // Test the extraction logic
      let courseCode = doc.id; // fallback to ID
      
      if (data.code) {
        courseCode = data.code;
      } else if (data.title) {
        const titleParts = data.title.split(' - ');
        if (titleParts.length > 0) {
          courseCode = titleParts[0].trim();
        }
      } else if (data.name) {
        const nameParts = data.name.split(' - ');
        if (nameParts.length > 0) {
          courseCode = nameParts[0].trim();
        }
      }
      
      console.log(`   Extracted Course Code: ${courseCode}`);
    });
    
    // 2. Check for ESM 161 specifically
    console.log('\n🔍 2. Looking for ESM 161 Course:');
    console.log('-'.repeat(30));
    
    const esm161Course = coursesSnapshot.docs.find(doc => {
      const data = doc.data();
      return data.code === 'ESM 161' || 
             data.title?.includes('ESM 161') || 
             data.name?.includes('ESM 161');
    });
    
    if (esm161Course) {
      const data = esm161Course.data();
      console.log(`✅ Found ESM 161 course:`);
      console.log(`   Course ID: ${esm161Course.id}`);
      console.log(`   Code: ${data.code}`);
      console.log(`   Title: ${data.title}`);
      console.log(`   Name: ${data.name}`);
      
      // Test extraction
      let courseCode = esm161Course.id;
      if (data.code) {
        courseCode = data.code;
      } else if (data.title) {
        const titleParts = data.title.split(' - ');
        if (titleParts.length > 0) {
          courseCode = titleParts[0].trim();
        }
      } else if (data.name) {
        const nameParts = data.name.split(' - ');
        if (nameParts.length > 0) {
          courseCode = nameParts[0].trim();
        }
      }
      console.log(`   Extracted Course Code: ${courseCode}`);
    } else {
      console.log('❌ ESM 161 course not found in academic-courses collection');
    }
    
    // 3. Check student registrations for ESM 161
    console.log('\n👥 3. Student Registrations with ESM 161:');
    console.log('-'.repeat(30));
    
    const registrationsRef = collection(db, 'course-registrations');
    const registrationsSnapshot = await getDocs(registrationsRef);
    
    const esm161Registrations = [];
    registrationsSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        const hasESM161 = data.courses.some(course => {
          if (typeof course === 'string') {
            return course.toUpperCase().includes('ESM 161');
          }
          return (
            (course.courseCode && course.courseCode.toUpperCase().includes('ESM 161')) ||
            (course.code && course.code.toUpperCase().includes('ESM 161')) ||
            (course.courseName && course.courseName.toUpperCase().includes('ESM 161')) ||
            (course.title && course.title.toUpperCase().includes('ESM 161'))
          );
        });
        
        if (hasESM161) {
          esm161Registrations.push({ id: doc.id, ...data });
        }
      }
    });
    
    console.log(`Found ${esm161Registrations.length} registrations with ESM 161:`);
    esm161Registrations.forEach((reg, index) => {
      console.log(`\n${index + 1}. ${reg.studentName} (${reg.registrationNumber})`);
      console.log(`   Year: ${reg.academicYear}, Semester: ${reg.semester}`);
      console.log(`   Courses:`);
      reg.courses.forEach(course => {
        if (typeof course === 'string') {
          console.log(`     - ${course}`);
        } else {
          console.log(`     - ${course.courseCode || course.code || course.courseName || course.title || 'Unknown'}: ${course.courseName || course.title || 'No name'}`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error testing course extraction:', error);
  }
}

testCourseExtraction(); 