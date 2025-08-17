import { NextResponse } from 'next/server';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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
    console.log('🔍 VALIDATE RESET TOKEN API CALLED');
    const body = await request.json();
    const { token } = body;
    
    console.log('📋 Validating reset token:', token?.substring(0, 8) + '...');
    
    // Validate required fields
    if (!token) {
      console.log('❌ Missing token');
      return NextResponse.json({ 
        success: false, 
        error: 'Reset token is required.' 
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
    
    // Find user with this reset token
    console.log('🔍 Looking for user with reset token...');
    const usersRef = collection(db, 'users');
    const tokenQuery = query(usersRef, where('resetToken', '==', token));
    const snapshot = await getDocs(tokenQuery);
    
    if (snapshot.empty) {
      console.log('❌ Reset token not found');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid reset token.' 
      }, { status: 404 });
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    // Check if token has expired
    if (userData.resetTokenExpiry) {
      const expiryDate = new Date(userData.resetTokenExpiry);
      const now = new Date();
      
      if (now > expiryDate) {
        console.log('❌ Reset token has expired');
        return NextResponse.json({ 
          success: false, 
          error: 'Reset token has expired. Please request a new password reset.' 
        }, { status: 410 });
      }
    }
    
    console.log('✅ Reset token is valid');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Reset token is valid.',
      userId: userDoc.id,
      email: userData.email
    });
  } catch (error) {
    console.error('❌ Validate reset token API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to validate reset token.' 
    }, { status: 500 });
  }
}







