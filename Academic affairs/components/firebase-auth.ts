// Firebase Authentication helpers
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

export interface UserData {
  uid: string
  username: string
  email: string
  name: string
  role: "director" | "staff" | "Lecturer" | "finance_officer" | "exam_officer" | "admissions_officer" | "registrar"
  department?: string
  position?: string
  assignedCourses?: string[]
  permissions: string[]
  status: "active" | "inactive" | "suspended"
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

// Create a new user with email and password
export async function createUser(
  email: string,
  password: string,
  userData: Omit<UserData, "uid" | "createdAt" | "updatedAt">
): Promise<UserData> {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const { uid } = userCredential.user
    
    // Set display name
    await updateProfile(userCredential.user, {
      displayName: userData.name
    })
    
    // Create a user document in Firestore
    const newUser: UserData = {
      uid,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await setDoc(doc(db, "users", uid), newUser)
    
    return newUser
  } catch (error: any) {
    console.error("Error creating user:", error)
    throw new Error(error.message || "Failed to create user")
  }
}

// Sign in a user with email and password
export async function signInUser(email: string, password: string): Promise<{
  user: UserData | null
  error?: string
}> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const userData = await getUserData(userCredential.user.uid)
    
    if (userData) {
      // Update last login
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      // Get updated user data
      const updatedUserData = await getUserData(userCredential.user.uid)
      return { user: updatedUserData }
    }
    
    return { user: null, error: "User data not found" }
  } catch (error: any) {
    console.error("Error signing in:", error)
    return { 
      user: null, 
      error: error.code === "auth/invalid-credential" 
        ? "Invalid email or password"
        : "Failed to sign in" 
    }
  }
}

// Get user data from Firestore
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    
    if (userDoc.exists()) {
      return userDoc.data() as UserData
    }
    
    return null
  } catch (error) {
    console.error("Error getting user data:", error)
    return null
  }
}

// Get user by username
export async function getUserByUsername(username: string): Promise<UserData | null> {
  try {
    const usersRef = collection(db, "users")
    const q = query(usersRef, where("username", "==", username))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as UserData
    }
    
    return null
  } catch (error) {
    console.error("Error getting user by username:", error)
    return null
  }
}

// Sign out the current user
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserData, "uid" | "createdAt">>
): Promise<UserData | null> {
  try {
    const userRef = doc(db, "users", uid)
    
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    })
    
    return await getUserData(uid)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return null
  }
}

// Create initial director and staff users
export async function createInitialUsers(): Promise<void> {
  try {
    // Check if director user already exists
    const directorUser = await getUserByUsername("director")
    
    if (!directorUser) {
      await createUser("director@university.edu", "admin123", {
        username: "director",
        name: "Dr. Sarah Johnson",
        email: "director@university.edu",
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
      })
      console.log("Director user created successfully")
    }
    
    // Check if staff users already exist
    const staffUser1 = await getUserByUsername("mchen")
    
    if (!staffUser1) {
      await createUser("mchen@university.edu", "password123", {
        username: "mchen",
        name: "Prof. Michael Chen",
        email: "mchen@university.edu",
        role: "staff",
        department: "Computer Science",
        position: "Professor",
        assignedCourses: ["CS 301", "CS 201"],
        permissions: ["course_management", "result_entry", "student_records", "daily_reports"],
        status: "active",
      })
      console.log("Staff user 1 created successfully")
    }
    
    const staffUser2 = await getUserByUsername("swilson")
    
    if (!staffUser2) {
      await createUser("swilson@university.edu", "password123", {
        username: "swilson",
        name: "Dr. Sarah Wilson",
        email: "swilson@university.edu",
        role: "staff",
        department: "Mathematics",
        position: "Associate Professor",
        assignedCourses: ["MATH 201", "MATH 301"],
        permissions: ["course_management", "result_entry", "daily_reports"],
        status: "active",
      })
      console.log("Staff user 2 created successfully")
    }
  } catch (error) {
    console.error("Error creating initial users:", error)
    throw error
  }
} 