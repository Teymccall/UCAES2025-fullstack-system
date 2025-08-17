const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, doc, getDoc } = require('firebase/firestore');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugStudentPortalLookup() {
  console.log('🔍 Debugging Student Portal Lookup...\n');

  try {
    // Step 1: Check what student IDs are in the users collection
    console.log('📋 Step 1: Checking users collection...');
    const usersRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`✅ Found ${usersSnapshot.size} users:`);
    const userEmails = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      userEmails.push({
        id: doc.id,
        email: data.email,
        name: `${data.surname || ''} ${data.otherNames || ''}`.trim()
      });
      console.log(`   - ${data.email} (ID: ${doc.id})`);
      console.log(`     Name: ${data.surname || ''} ${data.otherNames || ''}`);
      console.log('');
    });

    // Step 2: Check course registrations for the specific students
    console.log('📋 Step 2: Checking course registrations for ben@gmail.com and pacmboro@outlook.com...');
    
    const testEmails = ['ben@gmail.com', 'pacmboro@outlook.com'];
    
    for (const email of testEmails) {
      console.log(`\n🔍 Looking for registrations for ${email}:`);
      
      // Method 1: By email
      const emailRegsRef = collection(db, "course-registrations");
      const emailRegsQuery = query(emailRegsRef, where("email", "==", email));
      const emailRegsSnapshot = await getDocs(emailRegsQuery);
      
      console.log(`   Method 1 (by email): Found ${emailRegsSnapshot.size} registrations`);
      emailRegsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${data.studentName} (${data.studentId})`);
        console.log(`       Year: ${data.academicYear}, Semester: ${data.semester}`);
        console.log(`       Courses: ${data.courses?.length || 0}`);
      });
      
      // Method 2: By studentId (email)
      const studentIdRegsQuery = query(emailRegsRef, where("studentId", "==", email));
      const studentIdRegsSnapshot = await getDocs(studentIdRegsQuery);
      
      console.log(`   Method 2 (by studentId): Found ${studentIdRegsSnapshot.size} registrations`);
      studentIdRegsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${data.studentName} (${data.studentId})`);
        console.log(`       Year: ${data.academicYear}, Semester: ${data.semester}`);
        console.log(`       Courses: ${data.courses?.length || 0}`);
      });
      
      // Method 3: Check student-registrations collection
      const studentRegsRef = collection(db, "student-registrations");
      const studentRegsQuery = query(studentRegsRef, where("email", "==", email));
      const studentRegsSnapshot = await getDocs(studentRegsQuery);
      
      console.log(`   Method 3 (student-registrations by email): Found ${studentRegsSnapshot.size} registrations`);
      studentRegsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`     - ${data.studentName || 'Unknown'} (${doc.id})`);
        console.log(`       Year: ${data.academicYear}, Semester: ${data.semester}`);
        console.log(`       Courses: ${data.courses?.length || 0}`);
      });
    }

    // Step 3: Check what the student portal's getStudentCourseRegistration function would find
    console.log('\n📋 Step 3: Simulating student portal lookup...');
    
    for (const email of testEmails) {
      console.log(`\n🔍 Simulating lookup for ${email}:`);
      
      // Find the user ID for this email
      const userDoc = userEmails.find(user => user.email === email);
      if (userDoc) {
        console.log(`   User ID: ${userDoc.id}`);
        
        // Simulate the portal's lookup logic
        const portalLookup = await simulatePortalLookup(userDoc.id, email);
        console.log(`   Portal lookup result: ${portalLookup ? 'FOUND' : 'NOT FOUND'}`);
      } else {
        console.log(`   ❌ No user found for email: ${email}`);
      }
    }

    console.log('\n✅ Student portal lookup debug completed!');
    console.log('💡 This will help identify why the student portal is not finding registrations.');

  } catch (error) {
    console.error('❌ Error debugging student portal lookup:', error);
  }
}

async function simulatePortalLookup(userId, email) {
  try {
    // Simulate the portal's lookup logic from academic-service.ts
    let results = [];
    
    // Method 1: Try by studentId (userId)
    let q = query(collection(db, "course-registrations"), where("studentId", "==", userId));
    let snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`     ✅ Found by userId (${userId}): ${snapshot.size} registrations`);
      return true;
    }
    
    // Method 2: Try by email
    q = query(collection(db, "course-registrations"), where("email", "==", email));
    snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`     ✅ Found by email (${email}): ${snapshot.size} registrations`);
      return true;
    }
    
    // Method 3: Try student-registrations collection
    q = query(collection(db, "student-registrations"), where("studentId", "==", userId));
    snapshot = await getDocs(q);
    if (!snapshot.empty) {
      console.log(`     ✅ Found in student-registrations by userId: ${snapshot.size} registrations`);
      return true;
    }
    
    console.log(`     ❌ No registrations found for ${email} (userId: ${userId})`);
    return false;
    
  } catch (error) {
    console.error('Error in portal lookup simulation:', error);
    return false;
  }
}

// Run the debug
debugStudentPortalLookup().then(() => {
  console.log('\n✅ Student portal lookup debug completed!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Debug failed:', error);
  process.exit(1);
}); 