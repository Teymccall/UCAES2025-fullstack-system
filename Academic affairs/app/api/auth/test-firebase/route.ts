import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('🔥 Testing Firebase connection in auth context...');
    
    const { db } = getFirebaseAdmin();
    console.log('✅ Firebase admin initialized');
    
    // Test basic collection access
    const usersRef = collection(db, 'users');
    console.log('✅ Users collection reference created');
    
    // Test query
    const userQuery = query(usersRef, where('username', '==', 'teymccall'));
    console.log('✅ Query created');
    
    const snapshot = await getDocs(userQuery);
    console.log('✅ Query executed, docs found:', snapshot.size);
    
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      console.log('✅ User data found:', {
        username: userData.username,
        email: userData.email,
        role: userData.role,
        hasPassword: !!userData.password
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection working',
      userFound: !snapshot.empty,
      userCount: snapshot.size
    });
    
  } catch (error) {
    console.error('❌ Firebase test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}














