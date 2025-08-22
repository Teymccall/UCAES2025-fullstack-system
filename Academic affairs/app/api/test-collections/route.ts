import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    console.log('🔍 Testing Firebase collections...');
    const adminDb = getDb();
    
    // List of collections to check
    const collectionsToCheck = [
      'student-registrations',
      'students', 
      'course-registrations',
      'results',
      'academic-years',
      'staff',
      'staff-members',
      'users',
      'course-registrations',
      'deferment-requests'
    ];
    
    const results: any = {};
    
    for (const collectionName of collectionsToCheck) {
      try {
        console.log(`📁 Checking collection: ${collectionName}`);
        const snapshot = await adminDb.collection(collectionName).limit(5).get();
        
        results[collectionName] = {
          exists: true,
          count: snapshot.size,
          sample: snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        };
        
        console.log(`✅ ${collectionName}: ${snapshot.size} documents`);
      } catch (error) {
        console.log(`❌ ${collectionName}: Error - ${error.message}`);
        results[collectionName] = {
          exists: false,
          error: error.message
        };
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Collection check completed',
      collections: results,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error testing collections:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to test collections',
      error: error.message
    }, { status: 500 });
  }
}
