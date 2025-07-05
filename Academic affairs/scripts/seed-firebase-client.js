// Firebase client-side seed script for Academic Affairs module
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, where, limit } = require('firebase/firestore');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initial results data
const initialResults = [
  {
    studentId: "ST001",
    courseId: "CS 101",
    courseCode: "CS 101",
    courseName: "Introduction to Programming",
    midterm: 85,
    final: 92,
    assignments: 88,
    total: 89,
    grade: "A-",
    status: "draft",
    submittedBy: "prof_chen",
    createdAt: new Date().toISOString()
  },
  {
    studentId: "ST002",
    courseId: "CS 201",
    courseCode: "CS 201",
    courseName: "Data Structures",
    midterm: 90,
    final: 95,
    assignments: 92,
    total: 93,
    grade: "A",
    status: "submitted",
    submittedBy: "prof_wilson",
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

// Initial tasks data
const initialTasks = [
  {
    task: "Submit final results for CS 301",
    deadline: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
    priority: "high",
    courseId: "CS 301",
    assignedTo: "prof_chen",
    status: "pending",
    createdAt: new Date().toISOString()
  },
  {
    task: "Enter midterm scores for CS 201",
    deadline: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0],
    priority: "medium",
    courseId: "CS 201",
    assignedTo: "prof_wilson",
    status: "pending",
    createdAt: new Date().toISOString()
  }
];

// Initial registration requests data
const initialRegistrationRequests = [
  {
    studentId: "ST001",
    courseCode: "CS 201",
    requestedBy: "ST001",
    status: "pending",
    timestamp: new Date().toISOString()
  },
  {
    studentId: "ST004",
    courseCode: "CS 201",
    requestedBy: "ST004",
    status: "pending",
    timestamp: new Date().toISOString()
  }
];

// Initial audit logs data
const initialAuditLogs = [
  {
    action: "RESULTS_APPROVED",
    performedBy: "Dr. Sarah Johnson",
    performedByRole: "director",
    targetStudentId: "ST002",
    details: "Results approved for CS 301",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString()
  },
  {
    action: "COURSE_ADDED",
    performedBy: "Prof. Michael Chen",
    performedByRole: "staff",
    targetStudentId: "ST001",
    details: "Added course CS 301 to student registration",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString()
  }
];

// Check if a collection is empty
async function isCollectionEmpty(collectionName) {
  try {
    const snapshot = await getDocs(query(collection(db, collectionName), limit(1)));
    return snapshot.empty;
  } catch (error) {
    console.error(`Error checking if collection ${collectionName} is empty:`, error);
    return false;
  }
}

// Seed collection if it's empty
async function seedCollectionIfEmpty(collectionName, data) {
  try {
    const isEmpty = await isCollectionEmpty(collectionName);
    
    if (isEmpty) {
      console.log(`Seeding ${collectionName} collection...`);
      
      let successCount = 0;
      for (const item of data) {
        try {
          await addDoc(collection(db, collectionName), item);
          successCount++;
        } catch (error) {
          console.error(`Error adding document to ${collectionName}:`, error);
        }
      }
      
      console.log(`Successfully seeded ${successCount} items to ${collectionName}`);
    } else {
      console.log(`${collectionName} collection already has data, skipping seed`);
    }
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
}

// Main seed function
async function seedFirebase() {
  try {
    console.log("Starting Firebase client seed process for Academic Affairs module...");
    
    // Seed collections (only the ones needed for the dashboard)
    await seedCollectionIfEmpty("results", initialResults);
    await seedCollectionIfEmpty("tasks", initialTasks);
    await seedCollectionIfEmpty("registrationRequests", initialRegistrationRequests);
    await seedCollectionIfEmpty("auditLogs", initialAuditLogs);
    
    console.log("Firebase seed process completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error in seed process:", error);
    process.exit(1);
  }
}

// Run the seed function
seedFirebase(); 