import { NextResponse } from 'next/server';

export async function GET() {
    const adminDb = getDb();
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Test file system access
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    console.log('📁 Service account path:', serviceAccountPath);
    console.log('📁 Current working directory:', process.cwd());
    console.log('📁 File exists:', fs.existsSync(serviceAccountPath));
    
    if (!fs.existsSync(serviceAccountPath)) {
      return NextResponse.json({
        success: false,
        error: 'Service account file not found',
        path: serviceAccountPath,
        cwd: process.cwd()
      });
    }
    
    // Test reading the service account
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Service account loaded for project:', serviceAccount.project_id);
    
    // Test Firebase Admin initialization
    const { initializeApp, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    
    const app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
      projectId: serviceAccount.project_id
    }, `debug-${Date.now()}`);
    
    console.log('✅ Firebase Admin app initialized');
    
    // Test Firestore connection
    const adminDb = getFirestore(app);
    console.log('✅ Firestore instance created');
    
    // Test a simple query
    const testRef = adminDb.collection('systemConfig').doc('academicPeriod');
    const testDoc = await testRef.get();
    
    console.log('✅ Firestore query successful');
    console.log('📄 Document exists:', testDoc.exists);
    
    if (testDoc.exists) {
      const data = testDoc.data();
      console.log('📄 Document data:', data);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection test successful',
      projectId: serviceAccount.project_id,
      documentExists: testDoc.exists,
      documentData: testDoc.exists ? testDoc.data() : null
    });
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
}
