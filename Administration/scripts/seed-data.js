// Seed data script for Firebase Firestore
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc,
  writeBatch
} = require('firebase/firestore');

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample data to seed the database
const sampleData = {
  programs: [
    { 
      code: "BESM", 
      name: "B.Sc. Environmental Science and Management", 
      faculty: "Environmental Studies", 
      description: "This program focuses on sustainable environmental management practices.",
      duration: "4 years",
      accredited: true,
      coordinator: "Dr. Francis Nyame"
    },
    { 
      code: "BSA", 
      name: "B.Sc. Sustainable Agriculture", 
      faculty: "Agricultural Sciences", 
      description: "A program designed to teach modern sustainable farming practices.",
      duration: "4 years",
      accredited: true,
      coordinator: "Dr. Emmanuel Boadu"
    },
    { 
      code: "BLE", 
      name: "B.Sc. Land Economy", 
      faculty: "Environmental Studies", 
      description: "This program focuses on land management, valuation, and economics.",
      duration: "4 years",
      accredited: true,
      coordinator: "Dr. Victoria Addo"
    }
  ],
  
  academicYears: [
    { id: "2024-2025", name: "2024/2025", current: true },
    { id: "2023-2024", name: "2023/2024", current: false }
  ],
  
  semesters: [
    { id: "first", name: "First Semester", current: true },
    { id: "second", name: "Second Semester", current: false }
  ],
  
  courses: [
    // Environmental Science courses
    { 
      code: "BESM101", 
      title: "Introduction to Environmental Science", 
      creditHours: 3,
      semester: "First",
      level: "100",
      department: "Environmental Science",
      program: "BESM",
      description: "An introduction to the fundamentals of environmental science and sustainability.",
      lecturer: "Dr. Francis Nyame",
      status: "Active",
      prerequisites: []
    },
    { 
      code: "BESM102", 
      title: "Environmental Chemistry", 
      creditHours: 3,
      semester: "First",
      level: "100",
      department: "Environmental Science",
      program: "BESM",
      description: "Study of chemical processes in the environment and their impact on ecosystems.",
      lecturer: "Dr. Rebecca Ansah",
      status: "Active",
      prerequisites: []
    },
    { 
      code: "BESM201", 
      title: "Ecology and Biodiversity", 
      creditHours: 3,
      semester: "First",
      level: "200",
      department: "Environmental Science",
      program: "BESM",
      description: "Study of ecosystems, biodiversity and conservation practices.",
      lecturer: "Dr. Samuel Owusu",
      status: "Active",
      prerequisites: ["BESM101"]
    },
    // Agriculture courses
    { 
      code: "BSA101", 
      title: "Introduction to Sustainable Agriculture", 
      creditHours: 3,
      semester: "First",
      level: "100",
      department: "Agriculture",
      program: "BSA",
      description: "Overview of sustainable agricultural principles and practices.",
      lecturer: "Prof. Joseph Mensah",
      status: "Active",
      prerequisites: []
    },
    { 
      code: "BSA102", 
      title: "Soil Science", 
      creditHours: 3,
      semester: "First",
      level: "100",
      department: "Agriculture",
      program: "BSA",
      description: "Study of soil properties, classification, and management for sustainable agriculture.",
      lecturer: "Dr. Emmanuel Boadu",
      status: "Active",
      prerequisites: []
    },
    // Land Economy courses
    { 
      code: "BLE101", 
      title: "Principles of Land Economy", 
      creditHours: 3,
      semester: "First",
      level: "100",
      department: "Land Economy",
      program: "BLE",
      description: "Introduction to land management, valuation, and economics.",
      lecturer: "Dr. Victoria Addo",
      status: "Active",
      prerequisites: []
    }
  ],
  
  students: [
    {
      indexNumber: "10288678",
      surname: "ACHUMBORO",
      otherNames: "JOSEPH ALI",
      gender: "Male",
      level: "300",
      dateOfBirth: "1999-05-15",
      nationality: "Ghanaian",
      programme: "B.Sc. Environmental Science and Management",
      entryQualification: "WASSCE",
      status: "Active",
      email: "joseph.achumboro@ucaes.edu.gh",
      phone: "0551234567",
      address: "Accra, Ghana",
      emergencyContact: {
        name: "Sarah Achumboro",
        phone: "0551234568",
        relationship: "Mother"
      }
    },
    {
      indexNumber: "123456789",
      surname: "DUKE",
      otherNames: "MCCALL HANAMEL",
      gender: "Male",
      level: "100",
      dateOfBirth: "2001-09-23",
      nationality: "Ghanaian",
      programme: "B.Sc. Sustainable Agriculture",
      entryQualification: "WASSCE",
      status: "Active",
      email: "mccall.duke@ucaes.edu.gh",
      phone: "0241234567",
      address: "Kumasi, Ghana",
      emergencyContact: {
        name: "John Duke",
        phone: "0241234568",
        relationship: "Father"
      }
    },
    {
      indexNumber: "10288636",
      surname: "MOHAMMED",
      otherNames: "ALI JOHANSON",
      gender: "Male",
      level: "100",
      dateOfBirth: "2002-03-10",
      nationality: "Ghanaian",
      programme: "B.Sc. Land Economy",
      entryQualification: "WASSCE",
      status: "Active",
      email: "ali.mohammed@ucaes.edu.gh",
      phone: "0201234567",
      address: "Tamale, Ghana",
      emergencyContact: {
        name: "Amina Mohammed",
        phone: "0201234568",
        relationship: "Mother"
      }
    }
  ]
};

// Function to add data to a collection
async function seedCollection(collectionName, data) {
  console.log(`Seeding collection: ${collectionName}...`);
  try {
    const collectionRef = db.collection(collectionName);
    let count = 0;
    
    // Use batched writes for better performance
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    
    for (const item of data) {
      const docRef = collectionRef.doc(); // Auto-generate ID
      currentBatch.set(docRef, {
        ...item,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      count++;
      operationCount++;
      
      // Firestore batches are limited to 500 operations
      if (operationCount === 500) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }
    }
    
    // Add the last batch if it has any operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    await Promise.all(batches.map(batch => batch.commit()));
    
    console.log(`Added ${count} documents to ${collectionName}.`);
    return count;
  } catch (error) {
    console.error(`Error seeding collection ${collectionName}:`, error);
    return 0;
  }
}

// Function to add program-course mappings
async function seedProgramCourses() {
  console.log(`Seeding program-courses mappings...`);
  try {
    const collectionRef = db.collection('program-courses');
    let count = 0;
    const batch = db.batch();
    
    for (const course of sampleData.courses) {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        programCode: course.program,
        courseCode: course.code,
        level: course.level,
        semester: course.semester,
        required: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++;
    }
    
    await batch.commit();
    console.log(`Added ${count} program-course mappings.`);
    return count;
  } catch (error) {
    console.error('Error seeding program-courses:', error);
    return 0;
  }
}

// Main function to seed all data
async function seedAllData() {
  console.log('Starting database seeding...');
  
  let totalAdded = 0;
  const results = {};
  
  // Seed each collection
  for (const [collection, data] of Object.entries(sampleData)) {
    const added = await seedCollection(collection, data);
    totalAdded += added;
    results[collection] = added;
  }
  
  // Add program-course mappings
  const programCoursesAdded = await seedProgramCourses();
  totalAdded += programCoursesAdded;
  results['program-courses'] = programCoursesAdded;
  
  console.log('\nDatabase seeding complete.');
  console.log(`Total documents added: ${totalAdded}`);
  console.log('\nSummary:');
  
  Object.entries(results)
    .sort((a, b) => b[1] - a[1])
    .forEach(([collection, count]) => {
      if (count > 0) {
        console.log(`- ${collection}: ${count} documents`);
      }
    });
  
  // Exit the process
  process.exit(0);
}

// Execute the main function
seedAllData().catch(error => {
  console.error('Error in seedAllData:', error);
  process.exit(1);
}); 