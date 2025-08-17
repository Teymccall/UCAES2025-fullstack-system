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

// Helper function to normalize semester formats for comparison
const normalizeSemester = (sem) => {
  if (!sem) return '';
  const normalized = sem.toString().toLowerCase().trim();
  
  // Handle "Semester 1" -> "first"
  if (normalized.includes('semester 1') || normalized.includes('first') || normalized === '1') return 'first';
  
  // Handle "Semester 2" -> "second"  
  if (normalized.includes('semester 2') || normalized.includes('second') || normalized === '2') return 'second';
  
  return normalized;
};

async function checkESM161Registrations() {
  try {
    console.log('🔍 Checking for ESM 161 registrations...');
    
    const registrationsRef = collection(db, 'course-registrations');
    const snapshot = await getDocs(registrationsRef);
    
    const esm161Registrations = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        const hasESM161 = data.courses.some(course => {
          if (typeof course === 'string') {
            return course.includes('ESM 161') || course.includes('ESM161');
          }
          return (course.courseCode && course.courseCode.includes('ESM 161')) ||
                 (course.code && course.code.includes('ESM 161')) ||
                 (course.title && course.title.includes('ESM 161'));
        });
        
        if (hasESM161) {
          esm161Registrations.push({ id: doc.id, ...data });
        }
      }
    });
    
    console.log(`\n📊 Found ${esm161Registrations.length} ESM 161 registrations`);
    
    if (esm161Registrations.length === 0) {
      console.log('❌ No students registered for ESM 161');
      return;
    }
    
    // Test semester matching for 2026-2027
    const targetYear = '2026-2027';
    const targetSemester = 'Semester 1';
    
    console.log(`\n🎯 Testing for Year: ${targetYear}, Semester: ${targetSemester}`);
    console.log('='.repeat(50));
    
    esm161Registrations.forEach((reg, index) => {
      const matchesYear = reg.academicYear === targetYear;
      const normalizedRegSemester = normalizeSemester(reg.semester);
      const normalizedSearchSemester = normalizeSemester(targetSemester);
      const matchesSemester = normalizedRegSemester === normalizedSearchSemester;
      
      console.log(`Registration ${index + 1}:`);
      console.log(`  ID: ${reg.id}`);
      console.log(`  Year: ${reg.academicYear} (matches: ${matchesYear})`);
      console.log(`  Semester: ${reg.semester} -> "${normalizedRegSemester}" (matches: ${matchesSemester})`);
      console.log(`  Student: ${reg.studentId}`);
      console.log(`  Registration Number: ${reg.registrationNumber}`);
      console.log(`  ✅ Would be found: ${matchesYear && matchesSemester ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Also check for any ESM courses
    console.log('\n🔍 Checking for ANY ESM course registrations...');
    const esmRegistrations = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.courses && Array.isArray(data.courses)) {
        const hasESM = data.courses.some(course => {
          if (typeof course === 'string') {
            return course.includes('ESM');
          }
          return (course.courseCode && course.courseCode.includes('ESM')) ||
                 (course.code && course.code.includes('ESM')) ||
                 (course.title && course.title.includes('ESM'));
        });
        
        if (hasESM) {
          esmRegistrations.push({ id: doc.id, ...data });
        }
      }
    });
    
    console.log(`\n📊 Found ${esmRegistrations.length} ESM course registrations`);
    
    // Show unique ESM courses
    const uniqueESMCourses = new Set();
    esmRegistrations.forEach(reg => {
      reg.courses.forEach(course => {
        if (typeof course === 'string') {
          if (course.includes('ESM')) uniqueESMCourses.add(course);
        } else if (course.courseCode && course.courseCode.includes('ESM')) {
          uniqueESMCourses.add(course.courseCode);
        } else if (course.title && course.title.includes('ESM')) {
          uniqueESMCourses.add(course.title);
        }
      });
    });
    
    console.log('\n📋 Unique ESM courses found:');
    uniqueESMCourses.forEach(course => {
      console.log(`  - ${course}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking ESM 161 registrations:', error);
  }
}

checkESM161Registrations(); 