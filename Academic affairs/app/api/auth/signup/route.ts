import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';

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

export async function POST(request: Request) {
  try {
    console.log('🔐 SIGNUP API CALLED');
    
    const body = await request.json();
    const { username, name, email, password, role } = body;
    
    console.log('📋 Signup data:', { username, name, email, role });
    
    if (!username || !name || !email || !password) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }
    
    console.log('🔧 Initializing Firebase...');
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Check if username or email already exists
    const usersRef = collection(db, 'users');
    
    console.log('🔍 Checking if username exists...');
    // Check username
    const usernameQuery = query(usersRef, where('username', '==', username));
    const usernameSnapshot = await getDocs(usernameQuery);
    if (!usernameSnapshot.empty) {
      console.log('❌ Username already exists');
      return NextResponse.json({ success: false, error: 'Username already exists.' }, { status: 409 });
    }
    
    console.log('🔍 Checking if email exists...');
    // Check email
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      console.log('❌ Email already exists');
      return NextResponse.json({ success: false, error: 'Email already exists.' }, { status: 409 });
    }
    
    console.log('🔐 Hashing password...');
    // Hash the password for storage
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique UID
    const uid = uuidv4();
    console.log('🆔 Generated UID:', uid);
    
    // Create a new user document in Firestore
    const newUserData = {
      uid: uid,
      username,
      name,
      email,
      password: hashedPassword, // Store hashed password for login verification
      role: role || 'director',
      department: 'Academic Affairs',
      position: 'Academic Director',
      permissions: [
        'full_access', 'staff_management', 'course_management', 'student_management',
        'result_management', 'academic_management', 'system_settings', 'audit_trail'
      ],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 Saving user to Firestore with uid as document ID...');
    // Persist using uid as the Firestore document ID for consistency across the app
    await setDoc(doc(db, 'users', uid), newUserData);
    console.log('✅ User saved successfully with ID:', uid);
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      user: { 
        username, 
        name, 
        email, 
        role: newUserData.role 
      } 
    });
    
  } catch (error) {
    console.error('❌ Signup API error:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ success: false, error: 'Signup failed.' }, { status: 500 });
  }
}
