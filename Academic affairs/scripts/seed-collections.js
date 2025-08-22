// Seed script for empty collections using working Firebase config
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs } = require("firebase/firestore");

// Use the working Firebase configuration from the project
const firebaseConfig = {
  apiKey: "AIzaSyDGpAHia_wEmrhnmYjrPf1n1TrAyoIaOGI",
  authDomain: "ucaes2025.firebaseapp.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.firebasestorage.app",
  messagingSenderId: "581632635532",
  appId: "1:581632635532:web:bb6ce1f2c25266d37ec9ac"
};

console.log('🌱 Seeding Empty Firebase Collections...');
console.log('='.repeat(50));

// Sample data for empty collections
const sampleResults = [
  {
    courseCode: "CS 301",
    courseName: "Advanced Programming",
    studentId: "ST001",
    studentName: "John Doe",
    grade: "A",
    score: 85,
    status: "pending",
    submittedBy: "Dr. Smith",
    submittedAt: new Date(),
    semester: "2024-2025",
    academicYear: "2024-2025"
  },
  {
    courseCode: "MATH 201",
    courseName: "Calculus II",
    studentId: "ST002", 
    studentName: "Jane Smith",
    grade: "B+",
    score: 78,
    status: "pending",
    submittedBy: "Prof. Johnson",
    submittedAt: new Date(),
    semester: "2024-2025",
    academicYear: "2024-2025"
  }
];

const sampleStaff = [
  {
    staffId: "SF001",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    department: "Computer Science",
    position: "Lecturer",
    permissions: ["course_management", "result_submission"],
    status: "active",
    createdAt: new Date()
  },
  {
    staffId: "SF002", 
    name: "Prof. Michael Brown",
    email: "michael.brown@university.edu",
    department: "Mathematics",
    position: "Lecturer",
    permissions: ["course_management", "result_submission"],
    status: "active",
    createdAt: new Date()
  }
];

const sampleStaffMembers = [
  {
    staffId: "SF003",
    name: "Dr. Emily Davis",
    email: "emily.davis@university.edu", 
    department: "Information Technology",
    position: "Senior Lecturer",
    permissions: ["course_management", "result_submission", "student_management"],
    status: "active",
    createdAt: new Date()
  }
];

async function seedCollection(collectionName, data, db) {
  try {
    console.log(`\n🔍 Checking ${collectionName} collection...`);
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    if (snapshot.empty) {
      console.log(`   📝 Collection is empty, seeding with ${data.length} items...`);
      
      for (const item of data) {
        await addDoc(collectionRef, item);
      }
      
      console.log(`   ✅ Successfully seeded ${collectionName} with ${data.length} items`);
    } else {
      console.log(`   ⚠️  Collection already has ${snapshot.size} items, skipping`);
    }
    
  } catch (error) {
    console.error(`   ❌ Error seeding ${collectionName}:`, error.message);
  }
}

async function seedCollections() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Seed empty collections
    await seedCollection('results', sampleResults, db);
    await seedCollection('staff', sampleStaff, db);
    await seedCollection('staff-members', sampleStaffMembers, db);
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seeding completed!');
    console.log('✅ Empty collections have been populated');
    console.log('✅ Dashboard should now show real data');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

seedCollections();