// Initialize users for the Academic Affairs module
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} = require('firebase/firestore');

// Firebase configuration from lib/firebase.ts
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
const auth = getAuth(app);
const db = getFirestore(app);

// Default users to create
const defaultUsers = [
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
  }
];

// Function to check if a user exists by username
async function getUserByUsername(username) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    
    return null;
  } catch (error) {
    console.error(`Error checking if user ${username} exists:`, error);
    return null;
  }
}

// Function to create a user
async function createUser(userData) {
  try {
    // Check if user already exists
    const existingUser = await getUserByUsername(userData.username);
    
    if (existingUser) {
      console.log(`User ${userData.username} already exists.`);
      return existingUser;
    }
    
    console.log(`Creating user: ${userData.username}...`);
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    const { uid } = userCredential.user;
    
    // Prepare user data for Firestore (remove password)
    const { password, ...userDataForFirestore } = userData;
    
    // Create user document in Firestore
    const userDoc = {
      uid,
      ...userDataForFirestore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to Firestore
    await setDoc(doc(db, "users", uid), userDoc);
    
    console.log(`Created user: ${userData.username} (${userData.role})`);
    return userDoc;
  } catch (error) {
    console.error(`Error creating user ${userData.username}:`, error.message);
    
    // Handle case where user might exist in Auth but not in Firestore
    if (error.code === 'auth/email-already-in-use') {
      console.log(`Attempting to sign in as ${userData.email} to get UID...`);
      try {
        // Try to sign in to get the UID
        const userCredential = await signInWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
        
        const { uid } = userCredential.user;
        
        // Check if Firestore document exists
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          console.log(`Creating missing Firestore document for ${userData.username}...`);
          
          // Prepare user data for Firestore (remove password)
          const { password, ...userDataForFirestore } = userData;
          
          // Create user document in Firestore
          const userDoc = {
            uid,
            ...userDataForFirestore,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Save to Firestore
          await setDoc(userDocRef, userDoc);
          console.log(`Created Firestore document for: ${userData.username} (${userData.role})`);
          return userDoc;
        } else {
          console.log(`User document already exists for ${userData.username}`);
          return userDocSnap.data();
        }
      } catch (signInError) {
        console.error(`Failed to sign in as ${userData.email}:`, signInError.message);
      }
    }
    return null;
  }
}

// Main function to create all default users
async function createDefaultUsers() {
  console.log('Starting user initialization...');
  
  for (const userData of defaultUsers) {
    await createUser(userData);
  }
  
  console.log('User initialization complete.');
  process.exit(0);
}

// Run the initialization
createDefaultUsers().catch(error => {
  console.error('Failed to initialize users:', error);
  process.exit(1);
}); 