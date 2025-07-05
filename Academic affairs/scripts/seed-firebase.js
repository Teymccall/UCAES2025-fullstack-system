// Firebase seed script for Academic Affairs module
const { initializeApp } = require("firebase/app")
const { getFirestore, collection, getDocs, addDoc, query, where } = require("firebase/firestore")
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth')

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Initial students data
const initialStudents = [
  {
    studentId: "ST001",
    name: "John Doe",
    email: "john.doe@student.edu",
    program: "Computer Science",
    level: "200",
    semester: "Fall 2024",
    enrolledCourses: ["CS 301", "CS 201", "CS 101"],
    gpa: 3.45,
    cgpa: 3.42,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    studentId: "ST002",
    name: "Jane Smith",
    email: "jane.smith@student.edu",
    program: "Computer Science",
    level: "300",
    semester: "Fall 2024",
    enrolledCourses: ["CS 301", "CS 201"],
    gpa: 3.78,
    cgpa: 3.65,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    studentId: "ST003",
    name: "Mike Johnson",
    email: "mike.johnson@student.edu",
    program: "Information Technology",
    level: "200",
    semester: "Fall 2024",
    enrolledCourses: ["CS 301", "CS 101"],
    gpa: 3.12,
    cgpa: 3.08,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    studentId: "ST004",
    name: "Sarah Wilson",
    email: "sarah.wilson@student.edu",
    program: "Computer Science",
    level: "100",
    semester: "Fall 2024",
    enrolledCourses: ["CS 101"],
    gpa: 3.89,
    cgpa: 3.89,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    studentId: "ST005",
    name: "David Brown",
    email: "david.brown@student.edu",
    program: "Information Technology",
    level: "300",
    semester: "Fall 2024",
    enrolledCourses: ["CS 301", "CS 201"],
    gpa: 3.56,
    cgpa: 3.48,
    status: "active",
    createdAt: new Date().toISOString(),
  },
]

// Initial courses data
const initialCourses = [
  {
    code: "CS 301",
    name: "Advanced Programming",
    description:
      "Advanced concepts in programming including data structures, algorithms, and software design patterns.",
    credits: 3,
    prerequisites: ["CS 201", "CS 101"],
    semester: "Fall 2024",
    department: "Computer Science",
    instructor: "Prof. Michael Chen",
    students: 45,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    code: "CS 201",
    name: "Data Structures",
    description: "Introduction to fundamental data structures and their applications in problem solving.",
    credits: 3,
    prerequisites: ["CS 101"],
    semester: "Fall 2024",
    department: "Computer Science",
    instructor: "Dr. Sarah Wilson",
    students: 38,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    code: "CS 101",
    name: "Introduction to Programming",
    description: "Basic programming concepts using modern programming languages.",
    credits: 4,
    prerequisites: [],
    semester: "Fall 2024",
    department: "Computer Science",
    instructor: "Prof. James Rodriguez",
    students: 52,
    status: "active",
    createdAt: new Date().toISOString(),
  },
]

// Initial programs data
const initialPrograms = [
  {
    code: "CS-BS",
    name: "Bachelor of Science in Computer Science",
    description:
      "Comprehensive undergraduate program in computer science covering programming, algorithms, and software engineering.",
    duration: "4 years",
    degreeType: "Bachelor's",
    requirements: ["120 credits", "Capstone project", "Internship"],
    courses: ["CS 101", "CS 201", "CS 301"],
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    code: "IT-BS",
    name: "Bachelor of Science in Information Technology",
    description: "Practical program focusing on information systems, networking, and technology management.",
    duration: "4 years",
    degreeType: "Bachelor's",
    requirements: ["120 credits", "Industry certification", "Practicum"],
    courses: ["IT 101", "IT 201", "IT 301"],
    status: "active",
    createdAt: new Date().toISOString(),
  },
]

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
  },
  {
    studentId: "ST003",
    courseId: "CS 101",
    courseCode: "CS 101",
    courseName: "Introduction to Programming",
    midterm: 78,
    final: 82,
    assignments: 85,
    total: 82,
    grade: "B",
    status: "submitted",
    submittedBy: "prof_rodriguez",
    submittedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
]

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
  },
  {
    task: "Review assignment submissions for CS 101",
    deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0],
    priority: "low",
    courseId: "CS 101",
    assignedTo: "prof_rodriguez",
    status: "pending",
    createdAt: new Date().toISOString()
  }
]

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
  },
  {
    studentId: "ST003",
    courseCode: "CS 201",
    requestedBy: "ST003",
    status: "pending",
    timestamp: new Date().toISOString()
  }
]

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
  },
  {
    action: "STUDENT_ADDED",
    performedBy: "Dr. Sarah Johnson",
    performedByRole: "director",
    targetStudentId: "ST005",
    details: "New student added to the system",
    timestamp: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  },
  {
    action: "REGISTRATION_SUBMITTED",
    performedBy: "John Doe",
    performedByRole: "student",
    targetStudentId: "ST001",
    details: "Course registration submitted for CS 201",
    timestamp: new Date(new Date().setHours(new Date().getHours() - 8)).toISOString()
  },
  {
    action: "ACCOUNT_LOGIN",
    performedBy: "Dr. Sarah Johnson",
    performedByRole: "director",
    targetStudentId: "SYSTEM",
    details: "Director logged into the system",
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)).toISOString()
  }
]

// Function to check if a collection is empty
async function isCollectionEmpty(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName))
  return snapshot.empty
}

// Function to seed a collection if it's empty
async function seedCollectionIfEmpty(collectionName, data) {
  try {
    const isEmpty = await isCollectionEmpty(collectionName)
    
    if (isEmpty) {
      console.log(`Seeding ${collectionName} collection...`)
      
      for (const item of data) {
        await addDoc(collection(db, collectionName), item)
      }
      
      console.log(`Successfully seeded ${data.length} items to ${collectionName}`)
    } else {
      console.log(`${collectionName} collection already has data, skipping seed`)
    }
  } catch (error) {
    console.error(`Error seeding ${collectionName}:`, error)
  }
}

// Main seed function
async function seedFirebase() {
  try {
    console.log("Starting Firebase seed process for Academic Affairs module...")
    
    // Seed students collection
    await seedCollectionIfEmpty("students", initialStudents)
    
    // Seed courses collection
    await seedCollectionIfEmpty("courses", initialCourses)
    
    // Seed programs collection
    await seedCollectionIfEmpty("programs", initialPrograms)
    
    // Seed results collection
    await seedCollectionIfEmpty("results", initialResults)
    
    // Seed tasks collection
    await seedCollectionIfEmpty("tasks", initialTasks)
    
    // Seed registration requests collection
    await seedCollectionIfEmpty("registrationRequests", initialRegistrationRequests)
    
    // Seed audit logs collection
    await seedCollectionIfEmpty("auditLogs", initialAuditLogs)
    
    console.log("Firebase seed process completed successfully!")
  } catch (error) {
    console.error("Error in seed process:", error)
  }
}

// Run the seed function
seedFirebase()
  .then(() => {
    console.log("Seed script execution finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Fatal error in seed script:", error)
    process.exit(1)
  }) 