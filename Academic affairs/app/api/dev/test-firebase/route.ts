import { NextResponse } from 'next/server';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  try {
    const testResults = [];
    
    // Test Firestore connectivity
    try {
      // Try to get users collection
      const usersSnapshot = await getDocs(collection(db, 'users'));
      testResults.push({
        service: 'Firestore',
        success: true,
        message: `Successfully connected to Firestore. Found ${usersSnapshot.size} users.`
      });
    } catch (firestoreError) {
      console.error('Firestore test failed:', firestoreError);
      testResults.push({
        service: 'Firestore',
        success: false,
        error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
      });
    }
    
    // Test Authentication service
    try {
      const currentUser = auth.currentUser;
      testResults.push({
        service: 'Authentication',
        success: true,
        message: currentUser 
          ? `Authentication service available. Current user: ${currentUser.email}` 
          : 'Authentication service available. No user currently signed in.'
      });
    } catch (authError) {
      console.error('Auth test failed:', authError);
      testResults.push({
        service: 'Authentication',
        success: false,
        error: authError instanceof Error ? authError.message : String(authError)
      });
    }
    
    // Return test results
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      testResults,
      environment: process.env.NODE_ENV,
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'ucaes2025'
    });
  } catch (error) {
    console.error('Firebase test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 