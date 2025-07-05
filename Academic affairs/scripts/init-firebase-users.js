// Script to initialize Firebase users

const { initializeApp } = require("firebase/app")
const { getFirestore, collection, query, where, getDocs, setDoc, doc } = require("firebase/firestore")
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require("firebase/auth")

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: "AIzaSyApaxK4QH3MKKK_z56PwSy8NeHlWkRa-XE",
  authDomain: "collage-of-agricuture.firebaseapp.com",
  databaseURL: "https://collage-of-agricuture-default-rtdb.firebaseio.com",
  projectId: "collage-of-agricuture",
  storageBucket: "collage-of-agricuture.firebasestorage.app",
  messagingSenderId: "657140601875",
  appId: "1:657140601875:web:524f0c169e32f656611be6",
  measurementId: "G-2WL7W0R9ZW",
}

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
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    )
    
    // Set display name
    await updateProfile(userCredential.user, {
      displayName: userData.name
    })
    
    const { uid } = userCredential.user
    
    // Create user document in Firestore
    const userDoc = {
      uid,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      position: userData.position,
      assignedCourses: userData.assignedCourses || [],
      permissions: userData.permissions,
      status: userData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await setDoc(doc(db, "users", uid), userDoc)
    
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