// Test script for student search functionality
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
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

async function testStudentSearch() {
  console.log("🧪 Testing Student Search Functionality");
  console.log("=====================================");
  
  try {
    // Test 1: Check course-registrations collection
    console.log("\n📚 Test 1: Checking course-registrations collection...");
    const courseRegsRef = collection(db, "course-registrations");
    const courseRegsSnapshot = await getDocs(courseRegsRef);
    
    console.log(`Found ${courseRegsSnapshot.size} course registrations`);
    
    if (courseRegsSnapshot.size > 0) {
      console.log("\n📋 Sample course registrations:");
      courseRegsSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Student: ${data.studentName || 'N/A'}`);
        console.log(`   Registration Number: ${data.registrationNumber || 'N/A'}`);
        console.log(`   Courses: ${data.courses?.length || 0} courses`);
        if (data.courses && data.courses.length > 0) {
          data.courses.forEach(course => {
            console.log(`     - ${course.courseCode || course.code}: ${course.courseName || course.title}`);
          });
        }
        console.log("   ---");
      });
    }
    
    // Test 2: Search for a specific student
    console.log("\n🔍 Test 2: Searching for specific student...");
    
    // Get the first registration number from the data
    if (courseRegsSnapshot.size > 0) {
      const firstReg = courseRegsSnapshot.docs[0].data();
      const testRegNumber = firstReg.registrationNumber;
      
      if (testRegNumber) {
        console.log(`Searching for student: ${testRegNumber}`);
        
        const searchQuery = query(
          courseRegsRef,
          where("registrationNumber", "==", testRegNumber)
        );
        
        const searchResult = await getDocs(searchQuery);
        console.log(`✅ Search result: Found ${searchResult.size} matching registrations`);
        
        if (searchResult.size > 0) {
          const studentData = searchResult.docs[0].data();
          console.log("👤 Student details:");
          console.log(`   Name: ${studentData.studentName}`);
          console.log(`   Email: ${studentData.email || 'N/A'}`);
          console.log(`   Program: ${studentData.program || 'N/A'}`);
          console.log(`   Level: ${studentData.level || 'N/A'}`);
        }
      }
    }
    
    // Test 3: Check for specific course codes
    console.log("\n🎯 Test 3: Checking for specific courses...");
    const courseCodesFound = new Set();
    
    courseRegsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.courses) {
        data.courses.forEach(course => {
          const code = course.courseCode || course.code;
          if (code) {
            courseCodesFound.add(code);
          }
        });
      }
    });
    
    console.log("📚 Available course codes:");
    Array.from(courseCodesFound).slice(0, 10).forEach(code => {
      console.log(`   - ${code}`);
    });
    
    console.log("\n✅ Student search test completed successfully!");
    
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testStudentSearch(); 