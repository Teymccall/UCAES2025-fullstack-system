import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';

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
    console.log('👥 CREATE STAFF API CALLED');
    const body = await request.json();
    const { 
      username, 
      name, 
      email, 
      password, 
      role, 
      department, 
      position, 
      permissions, 
      status 
    } = body;
    
    console.log('📋 Creating staff account:', { username, email, role });
    
    // Validate required fields
    if (!username || !name || !email || !password || !role) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'All required fields must be provided.' 
      }, { status: 400 });
    }
    
    // Initialize Firebase
    console.log('🔧 Initializing Firebase...');
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');
    
    // Check if username already exists
    console.log('🔍 Checking for existing username:', username);
    const usersRef = collection(db, 'users');
    const usernameQuery = query(usersRef, where('username', '==', username));
    const usernameSnapshot = await getDocs(usernameQuery);
    
    if (!usernameSnapshot.empty) {
      console.log('❌ Username already exists:', username);
      return NextResponse.json({ 
        success: false, 
        error: 'Username already exists.' 
      }, { status: 409 });
    }
    
    // Check if email already exists
    console.log('🔍 Checking for existing email:', email);
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
    
    if (!emailSnapshot.empty) {
      console.log('❌ Email already exists:', email);
      return NextResponse.json({ 
        success: false, 
        error: 'Email already exists.' 
      }, { status: 409 });
    }
    
    // Hash the password for storage
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a unique UID
    const uid = uuidv4();
    
    // Create user document in Firestore
    const userData = {
      uid,
      username,
      name,
      email,
      password: hashedPassword, // Store hashed password for login verification
      role,
      department: department || '',
      position: position || '',
      permissions: permissions || [],
      status: status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('💾 Saving user to Firestore...');
    await setDoc(doc(db, 'users', uid), userData);
    
    // Return user data without sensitive information
    const userResponse = {
      id: uid,
      uid,
      username,
      name,
      email,
      role,
      department: department || '',
      position: position || '',
      permissions: permissions || [],
      status: status || 'active',
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
    
    console.log('✅ Staff account created successfully:', username);
    
    return NextResponse.json({ 
      success: true, 
      user: userResponse 
    });
  } catch (error) {
    console.error('❌ Create staff API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create staff account.' 
    }, { status: 500 });
  }
}







