// Script to initialize Firebase users

const { initializeApp } = require("firebase/app")
const { getFirestore, collection, query, where, getDocs, setDoc, doc, addDoc } = require("firebase/firestore")
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require("firebase/auth")
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")

// Firebase configuration for UCAES
const firebaseConfig = {
  apiKey: "AIzaSyCWj01Z1zScFJbTh5ChqsLEEZZdmBOjlUE",
  authDomain: "ucaes2025.firebaseapp.com",
  databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
  projectId: "ucaes2025",
  storageBucket: "ucaes2025.appspot.com",
  messagingSenderId: "543217800581",
  appId: "1:543217800581:web:4f97ba0087f694deeea0ec",
  measurementId: "G-8E3518ML0D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Initial users to create
const initialUsers = [
  {
    username: "director",
    name: "Dr. Sarah Johnson",
    email: "director@university.edu",
    password: "admin123",
    role: "director",
    department: "Academic Affairs",
    position: "Academic Director",
    permissions: [
      "full_access",
      "staff_management",
      "course_management",
      "student_management",
      "result_management",
      "academic_management",
      "system_settings",
      "audit_trail",
    ],
    status: "active",
  },
  {
    username: "mchen",
    name: "Prof. Michael Chen",
    email: "mchen@university.edu",
    password: "password123",
    role: "staff",
    department: "Computer Science",
    position: "Professor",
    assignedCourses: ["CS 301", "CS 201"],
    permissions: ["course_management", "result_entry", "student_records", "daily_reports"],
    status: "active",
  },
  {
    username: "swilson",
    name: "Dr. Sarah Wilson",
    email: "swilson@university.edu",
    password: "password123",
    role: "staff",
    department: "Mathematics",
    position: "Associate Professor",
    assignedCourses: ["MATH 201", "MATH 301"],
    permissions: ["course_management", "result_entry", "daily_reports"],
    status: "active",
  },
]

// Create a user in Firebase Auth and Firestore
async function createUser(userData) {
  try {
    console.log(`Checking if user ${userData.username} already exists...`)
    
    // Check if username already exists
    const usernameQuery = query(
      collection(db, "users"),
      where("username", "==", userData.username)
    )
    const usernameSnapshot = await getDocs(usernameQuery)
    
    if (!usernameSnapshot.empty) {
      console.log(`Username ${userData.username} already exists, skipping...`)
      return
    }
    
    // Check if email already exists
    const emailQuery = query(
      collection(db, "users"),
      where("email", "==", userData.email)
    )
    const emailSnapshot = await getDocs(emailQuery)
    
    if (!emailSnapshot.empty) {
      console.log(`Email ${userData.email} already exists, skipping...`)
      return
    }
    
    console.log(`Creating user ${userData.username}...`)
    
    // Hash password for storage
    const hashedPassword = await bcrypt.hash(userData.password, 10)
    
    // Generate a unique ID
    const uid = uuidv4()
    
    // Create user document in Firestore
    const userDoc = {
      uid,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      password: hashedPassword, // Store hashed password
      role: userData.role,
      department: userData.department,
      position: userData.position,
      assignedCourses: userData.assignedCourses || [],
      permissions: userData.permissions,
      status: userData.status,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Add to users collection
    await addDoc(collection(db, "users"), userDoc)
    
    // Add to academic-staff collection if staff role
    if (userData.role === 'staff') {
      await addDoc(collection(db, "academic-staff"), {
        uid,
        name: userData.name,
        email: userData.email,
        department: userData.department,
        permissions: userData.permissions,
        status: userData.status
      })
    }
    
    console.log(`User ${userData.username} created successfully`)
    return userDoc
  } catch (error) {
    console.error(`Error creating user ${userData.username}:`, error.message)
  }
}

// Initialize all users
async function initializeUsers() {
  console.log("Initializing users...")
  
  for (const userData of initialUsers) {
    await createUser(userData)
  }
  
  console.log("Initialization complete!")
  process.exit(0)
}

// Run the initialization
initializeUsers().catch((error) => {
  console.error("Initialization failed:", error)
  process.exit(1)
}) 