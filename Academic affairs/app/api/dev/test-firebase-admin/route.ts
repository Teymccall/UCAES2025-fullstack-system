import { NextResponse } from 'next/server';
import { getDb, getAuthInstance } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const adminDb = getDb();
    const adminAuth = getAuthInstance();
    const testResults = [];
    
    // Test Firestore Admin connectivity
    try {
      // Try to get users collection
      const usersSnapshot = await adminDb.collection('users').limit(5).get();
      testResults.push({
        service: 'Firestore Admin',
        success: true,
        message: `Successfully connected to Firestore Admin. Found ${usersSnapshot.size} users.`,
        data: usersSnapshot.docs.map(doc => ({ id: doc.id, exists: doc.exists }))
      });
    } catch (firestoreError) {
      console.error('Firestore Admin test failed:', firestoreError);
      testResults.push({
        service: 'Firestore Admin',
        success: false,
        error: firestoreError instanceof Error ? firestoreError.message : String(firestoreError)
      });
    }
    
    // Test Auth Admin service
    try {
      // Try to list users (limited to 5)
      const listUsersResult = await adminAuth.listUsers(5);
      testResults.push({
        service: 'Authentication Admin',
        success: true,
        message: `Successfully connected to Auth Admin. Found ${listUsersResult.users.length} users.`,
        data: listUsersResult.users.map(user => ({ uid: user.uid, email: user.email }))
      });
    } catch (authError) {
      console.error('Auth Admin test failed:', authError);
      testResults.push({
        service: 'Authentication Admin',
        success: false,
        error: authError instanceof Error ? authError.message : String(authError)
      });
    }
    
    // Return test results
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      testResults,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Firebase Admin test API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
} 