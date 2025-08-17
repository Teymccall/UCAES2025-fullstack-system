import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';

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
    console.log('🔐 LOGIN API CALLED');
    const body = await request.json();
    const { username, password } = body;
    
    console.log('📋 Login attempt:', { username, hasPassword: !!password });
    
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json({ 
        success: false, 
        error: 'Username and password are required.' 
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
    
    // Find user in Firebase using Firestore v9+ API (try both username and email)
    console.log('🔍 Looking up user:', username);
    const usersRef = collection(db, 'users');
    
    // First try to find by username
    let userQuery = query(usersRef, where('username', '==', username));
    let snapshot = await getDocs(userQuery);
    
    // If not found by username, try email
    if (snapshot.empty) {
      console.log('🔍 Username not found, trying email...');
      userQuery = query(usersRef, where('email', '==', username));
      snapshot = await getDocs(userQuery);
    }
    
    if (snapshot.empty) {
      console.log('❌ User not found by username or email:', username);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid username or password.' 
      }, { status: 401 });
    }
    
    const userData = snapshot.docs[0].data();
    const userId = snapshot.docs[0].id;
    const userEmail = userData.email;
    
    console.log('✅ User found:', username, 'Email:', userEmail);
    console.log('🔍 Document ID:', userId);
    console.log('🔍 Stored UID:', userData.uid);
    console.log('🔍 User role:', userData.role);
    console.log('🔍 User status:', userData.status);
    
    // Check if user has a stored password hash for verification
    if (!userData.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'User account not properly configured. Please contact administrator.' 
      }, { status: 500 });
    }
    
    // Verify password against stored hash
    console.log('🔐 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, userData.password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid username or password.' 
      }, { status: 401 });
    }
    
    // Check if user is active
    if (userData.status !== "active") {
      return NextResponse.json({ 
        success: false, 
        error: 'Your account is not active. Please contact the administrator.' 
      }, { status: 401 });
    }
    
    // Generate a session token
    const sessionToken = uuidv4();
    // Always use the Firestore document ID for downstream client lookups
    // This guarantees the client can read the user document regardless of how it was created
    const userUid = userId;
    
    try {
      // Update user's session token using the Firestore document ID
      const userDocRef = doc(db, 'users', userUid);
      await updateDoc(userDocRef, {
        sessionToken: sessionToken,
        lastLogin: new Date()
      });
      
      console.log('✅ Session updated for user:', username);
    } catch (updateError) {
      console.warn('⚠️ Could not update session:', updateError);
      // Continue anyway - login can still work
    }
    
    // Return user data without sensitive information
    // Use the Firestore document id to ensure downstream listeners find the document
    const userResponse = {
      uid: userUid,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      permissions: userData.permissions,
      status: userData.status,
      sessionToken
    };
    
    console.log('✅ Login successful for:', username, 'Role:', userData.role);
    console.log('📤 Returning user response:', {
      uid: userResponse.uid,
      username: userResponse.username,
      role: userResponse.role,
      status: userResponse.status
    });
    
    // Return complete user data
    const responseData = { 
      success: true, 
      user: userResponse
    };
    
    console.log('📤 Complete response data:', JSON.stringify(responseData, null, 2));
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed.' 
    }, { status: 500 });
  }
} 