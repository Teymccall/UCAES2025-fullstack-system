import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

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
    console.log('🔄 CONFIRM RESET PASSWORD API CALLED');
    const body = await request.json();
    const { token, newPassword } = body;
    
    console.log('📋 Confirming password reset with token:', token?.substring(0, 8) + '...');
    
    // Validate required fields
    if (!token || !newPassword) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        error: 'Reset token and new password are required.' 
      }, { status: 400 });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      console.log('❌ Password too short');
      return NextResponse.json({ 
        success: false, 
        error: 'Password must be at least 8 characters long.' 
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
    const userId = userDoc.id;
    
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
    
    // Hash the new password
    console.log('🔐 Hashing new password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user document with new password and clear reset token
    console.log('💾 Updating user password and clearing reset token...');
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      password: hashedPassword,
      resetToken: null, // Clear the reset token so it can't be used again
      resetTokenExpiry: null,
      passwordResetAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('✅ Password reset completed successfully for user:', userId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('❌ Confirm reset password API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to reset password.' 
    }, { status: 500 });
  }
}







