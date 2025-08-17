// Seed data script for Firebase Firestore - Lecture Platform
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

// Firebase configuration from your project
const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  databaseURL: "https://collage-of-agricuture-default-rtdb.firebaseio.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data for Lecture Platform
const sampleUsers = [
  {
    id: "lecturer-001",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@ucaes.edu.gh",
    role: "Lecturer",
    department: "Agricultural Sciences",
    assignedCourses: ["AGRI301", "AGRI401", "ENVS201"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "lecturer-002",
    name: "Prof. Michael Asante",
    email: "michael.asante@ucaes.edu.gh",
    role: "Lecturer",
    department: "Environmental Studies",
    assignedCourses: ["ENVS301", "ENVS401"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const sampleCourses = [
  {
    id: "AGRI301",
    code: "AGRI301",
    title: "Crop Production Systems",
    semester: "2024/2025 Semester 1",
    level: 300,
    credits: 3,
    department: "Agricultural Sciences",
    lecturerId: "lecturer-001",
    description: "Advanced study of crop production systems and sustainable farming practices.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "AGRI401",
    code: "AGRI401",
    title: "Agricultural Economics",
    semester: "2024/2025 Semester 1",
    level: 400,
    credits: 3,
    department: "Agricultural Sciences",
    lecturerId: "lecturer-001",
    description: "Economic principles applied to agricultural production and marketing.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ENVS201",
    code: "ENVS201",
    title: "Environmental Chemistry",
    semester: "2024/2025 Semester 1",
    level: 200,
    credits: 3,
    department: "Environmental Studies",
    lecturerId: "lecturer-001",
    description: "Chemical processes in environmental systems.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ENVS301",
    code: "ENVS301",
    title: "Environmental Impact Assessment",
    semester: "2024/2025 Semester 1",
    level: 300,
    credits: 3,
    department: "Environmental Studies",
    lecturerId: "lecturer-002",
    description: "Methods and practices for assessing environmental impacts.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "ENVS401",
    code: "ENVS401",
    title: "Climate Change and Adaptation",
    semester: "2024/2025 Semester 1",
    level: 400,
    credits: 3,
    department: "Environmental Studies",
    lecturerId: "lecturer-002",
    description: "Climate change science and adaptation strategies.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const sampleStudents = [
  {
    id: "student-001",
    indexNumber: "AG/2021/001234",
    firstName: "Kwame",
    lastName: "Osei",
    email: "kwame.osei@student.ucaes.edu.gh",
    level: 300,
    department: "Agricultural Sciences",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "student-002",
    indexNumber: "AG/2021/001235",
    firstName: "Akosua",
    lastName: "Mensah",
    email: "akosua.mensah@student.ucaes.edu.gh",
    level: 300,
    department: "Agricultural Sciences",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "student-003",
    indexNumber: "AG/2021/001236",
    firstName: "Kofi",
    lastName: "Asante",
    email: "kofi.asante@student.ucaes.edu.gh",
    level: 400,
    department: "Agricultural Sciences",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "student-004",
    indexNumber: "ENV/2022/002001",
    firstName: "Ama",
    lastName: "Boateng",
    email: "ama.boateng@student.ucaes.edu.gh",
    level: 200,
    department: "Environmental Studies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "student-005",
    indexNumber: "ENV/2021/002002",
    firstName: "Yaw",
    lastName: "Owusu",
    email: "yaw.owusu@student.ucaes.edu.gh",
    level: 300,
    department: "Environmental Studies",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const sampleRegistrations = [
  {
    id: "reg-001",
    studentId: "student-001",
    courseId: "AGRI301",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "reg-002",
    studentId: "student-002",
    courseId: "AGRI301",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "reg-003",
    studentId: "student-003",
    courseId: "AGRI401",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "reg-004",
    studentId: "student-004",
    courseId: "ENVS201",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "reg-005",
    studentId: "student-005",
    courseId: "ENVS301",
    semester: "2024/2025 Semester 1",
    status: "Active",
    registrationDate: "2024-08-15",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const sampleGrades = [
  {
    id: "grade-001",
    studentId: "student-001",
    courseId: "AGRI301",
    lecturerId: "lecturer-001",
    grade: "A",
    remarks: "Excellent performance",
    status: "pending",
    submittedAt: "2024-12-01T10:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "grade-002",
    studentId: "student-002",
    courseId: "AGRI301",
    lecturerId: "lecturer-001",
    grade: "B+",
    remarks: "Good understanding of concepts",
    status: "approved",
    submittedAt: "2024-12-01T10:00:00Z",
    approvedAt: "2024-12-02T14:30:00Z",
    approvedBy: "admin-001",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

const sampleAnnouncements = [
  {
    id: "ann-001",
    title: "Mid-Semester Examination Schedule",
    content: "The mid-semester examinations will begin on October 15, 2024. Please check your course pages for specific dates and times.",
    authorId: "lecturer-001",
    authorName: "Dr. Sarah Johnson",
    department: "Agricultural Sciences",
    isActive: true,
    createdAt: "2024-09-25T09:00:00Z",
    updatedAt: "2024-09-25T09:00:00Z"
  },
  {
    id: "ann-002",
    title: "Guest Lecture: Climate Change Adaptation",
    content: "We will be hosting a guest lecture on Climate Change Adaptation by Prof. James Smith from Oxford University on November 5, 2024 at 2:00 PM in the Main Auditorium.",
    authorId: "lecturer-002",
    authorName: "Prof. Michael Asante",
    department: "Environmental Studies",
    isActive: true,
    createdAt: "2024-10-15T14:30:00Z",
    updatedAt: "2024-10-15T14:30:00Z"
  },
];

const sampleCourseMaterials = [
  {
    id: "material-001",
    courseId: "AGRI301",
    lecturerId: "lecturer-001",
    title: "Introduction to Crop Production Systems",
    type: "lecture_notes",
    fileUrl: "https://example.com/materials/agri301/lecture1.pdf",
    description: "Lecture notes for the first week of class.",
    uploadedAt: "2024-09-01T10:00:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "material-002",
    courseId: "AGRI301",
    lecturerId: "lecturer-001",
    title: "Sustainable Farming Practices",
    type: "assignment",
    fileUrl: "https://example.com/materials/agri301/assignment1.pdf",
    description: "First assignment on sustainable farming practices.",
    dueDate: "2024-09-20T23:59:59Z",
    uploadedAt: "2024-09-05T14:30:00Z",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
];

// Function to seed a collection with data
async function seedCollection(collectionName, data) {
  console.log(`Seeding ${collectionName} collection...`);
  
  try {
    // First clear the collection
    const snapshot = await getDocs(collection(db, collectionName));
    const deletePromises = [];
    
    snapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, collectionName, document.id)));
    });
    
    await Promise.all(deletePromises);
    console.log(`Cleared ${deletePromises.length} documents from ${collectionName}`);
    
    // Now add the sample data
    const batch = writeBatch(db);
    
    for (const item of data) {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    }
    
    await batch.commit();
    console.log(`Added ${data.length} documents to ${collectionName}`);
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error);
  }
}

// Main function to seed all collections
async function seedAllData() {
  try {
    // Temporarily modify security rules to allow seeding
    console.log("Starting data seeding process...");
    
    await seedCollection('users', sampleUsers);
    await seedCollection('courses', sampleCourses);
    await seedCollection('students', sampleStudents);
    await seedCollection('registrations', sampleRegistrations);
    await seedCollection('grades', sampleGrades);
    await seedCollection('announcements', sampleAnnouncements);
    await seedCollection('courseMaterials', sampleCourseMaterials);
    
    console.log('All data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeding process
seedAllData(); 