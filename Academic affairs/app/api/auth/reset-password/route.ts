import { NextResponse } from 'next/server';
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
    console.log('🔄 PASSWORD RESET API CALLED');
    const body = await request.json();
    const { userId, newPassword, email } = body;
    
    console.log('📋 Resetting password for user:', { userId, email });
    
    // Validate required fields
    if (!userId || !newPassword) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'User ID and new password are required.' 
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
    
    // Find the user document
    console.log('🔍 Looking up user by ID:', userId);
    const userDocRef = doc(db, 'users', userId);
    
    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user document with new password hash
    const updateData: any = {
      password: hashedPassword,
      passwordResetAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // If email is provided and different, update it too
    if (email) {
      updateData.email = email;
    }
    
    console.log('💾 Updating user password...');
    await updateDoc(userDocRef, updateData);
    
    console.log('✅ Password reset successfully for user:', userId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully.' 
    });
  } catch (error) {
    console.error('❌ Password reset API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to reset password.' 
    }, { status: 500 });
  }
}







