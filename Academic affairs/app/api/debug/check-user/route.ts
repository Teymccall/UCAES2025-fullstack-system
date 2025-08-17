import { NextResponse } from 'next/server';

// Import client-side Firebase
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
    console.log('🔍 DEBUG CHECK USER API CALLED');
    const body = await request.json();
    const { userId } = body;
    
    // Initialize Firebase
    let app;
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    const db = getFirestore(app);
    
    // Get user document
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found',
        userId 
      });
    }
    
    const userData = userDoc.data();
    
    return NextResponse.json({ 
      success: true, 
      user: {
        id: userDoc.id,
        ...userData,
        password: userData.password ? 'EXISTS' : 'MISSING', // Don't expose actual password
      }
    });
  } catch (error) {
    console.error('❌ Debug check user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to check user.' 
    }, { status: 500 });
  }
}







