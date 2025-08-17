import { NextRequest, NextResponse } from 'next/server';

// GET - Get current admission settings and statistics
export async function GET() {
    const adminDb = getDb();
  try {
    console.log('🔍 Starting admission settings fetch...');
    
    // Import Firebase Admin modules directly
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    
    // Load service account
    const fs = await import('fs');
    const path = await import('path');
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account not found at ${serviceAccountPath}`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    console.log('✅ Service account loaded for project:', serviceAccount.project_id);
    
    // Initialize Firebase Admin with explicit credentials
    let app;
    const existingApps = getApps();
    
    // Use existing app if available, otherwise create new one
    if (existingApps.length > 0) {
      app = existingApps[0];
      console.log('✅ Using existing Firebase Admin app');
    } else {
      app = initializeApp({
        credential: cert(serviceAccount),
        databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
        projectId: serviceAccount.project_id
      });
      console.log('✅ Created new Firebase Admin app');
    }
    console.log('✅ Firebase Admin app initialized');
    
    // Get Firestore instance
    const adminDb = getFirestore(app);
    console.log('✅ Firestore instance created');
    
    // Get current year from systemConfig (centralized system)
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
    const systemConfigDoc = await systemConfigRef.get();
    
    let currentYear = null;
    if (systemConfigDoc.exists) {
      const systemData = systemConfigDoc.data();
      console.log('✅ Found systemConfig:', systemData);
      
      if (systemData?.currentAcademicYearId) {
        // Get the actual academic year document
        const yearRef = adminDb.collection('academic-years').doc(systemData.currentAcademicYearId);
        const yearDoc = await yearRef.get();
        
        if (yearDoc.exists) {
          const yearData = yearDoc.data();
          currentYear = {
            id: yearDoc.id,
            year: yearData?.year || '',
            displayName: yearData?.displayName || yearData?.year || '',
            admissionStatus: yearData?.admissionStatus || 'closed',
            startDate: yearData?.startDate ? (typeof yearData.startDate.toDate === 'function' ? yearData.startDate.toDate().toISOString() : yearData.startDate) : '',
            endDate: yearData?.endDate ? (typeof yearData.endDate.toDate === 'function' ? yearData.endDate.toDate().toISOString() : yearData.endDate) : '',
            maxApplications: yearData?.maxApplications || null,
            currentApplications: yearData?.currentApplications || 0,
            admissionStartDate: yearData?.admissionStartDate ? (typeof yearData.admissionStartDate.toDate === 'function' ? yearData.admissionStartDate.toDate().toISOString() : yearData.admissionStartDate) : '',
            admissionEndDate: yearData?.admissionEndDate ? (typeof yearData.admissionEndDate.toDate === 'function' ? yearData.admissionEndDate.toDate().toISOString() : yearData.admissionEndDate) : ''
          };
          console.log('✅ Found current academic year:', currentYear);
        }
      }
    } else {
      console.log('⚠️ No systemConfig found - director needs to set current academic year');
    }
    
    // Get all academic years using Firebase Admin SDK
    console.log('🔍 Fetching all academic years...');
    const yearsCollection = adminDb.collection('academic-years');
    const yearsSnapshot = await yearsCollection.get(); // Remove orderBy for now to avoid index issues
    const availableYears = yearsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Include document ID for unique React keys
        year: data.year || '',
        displayName: data.displayName || data.year || '',
        startDate: data.startDate ? (typeof data.startDate.toDate === 'function' ? data.startDate.toDate().toISOString() : data.startDate) : '',
        endDate: data.endDate ? (typeof data.endDate.toDate === 'function' ? data.endDate.toDate().toISOString() : data.endDate) : '',
        admissionStatus: data.admissionStatus || 'closed',
      };
    });
    
    // Sort in JavaScript instead of using Firestore orderBy to avoid index issues
    availableYears.sort((a, b) => b.year.localeCompare(a.year));
    
    console.log(`✅ Found ${availableYears.length} academic years`);
    
    // Simple statistics (you can enhance this later)
    const statistics = {
      totalApplications: 0,
      maxApplications: currentYear?.maxApplications || null,
      admissionStartDate: currentYear?.admissionStartDate || '',
      admissionEndDate: currentYear?.admissionEndDate || ''
    };
    
    return NextResponse.json({
      success: true,
      currentYear,
      statistics,
      availableYears
    });
  } catch (error) {
    console.error('Error fetching admission settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admission settings' },
      { status: 500 }
    );
  }
}

// PATCH - Update admission status
export async function PATCH(request: NextRequest) {
    const adminDb = getDb();
  try {
    const body = await request.json();
    const { year, status, admissionStartDate, admissionEndDate, userId } = body;
    
    if (!year || !status || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 Updating admission status for ${year} to ${status}...`);
    
    // Initialize Firebase Admin directly
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    
    // Load service account
    const fs = await import('fs');
    const path = await import('path');
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account not found at ${serviceAccountPath}`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Create a new app instance
    const timestamp = Date.now();
    const appName = `patch-admin-${timestamp}`;
    
    const app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
      projectId: serviceAccount.project_id
    }, appName);
    
    const adminDb = getFirestore(app);
    
    // First, get the current academic year ID from systemConfig
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
    const systemConfigDoc = await systemConfigRef.get();
    
    if (!systemConfigDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'No current academic year configured' },
        { status: 400 }
      );
    }
    
    const systemData = systemConfigDoc.data();
    const currentAcademicYearId = systemData?.currentAcademicYearId;
    
    if (!currentAcademicYearId) {
      return NextResponse.json(
        { success: false, error: 'No current academic year ID found' },
        { status: 400 }
      );
    }
    
    // Verify the year matches the current academic year
    const yearRef = adminDb.collection('academic-years').doc(currentAcademicYearId);
    const yearDoc = await yearRef.get();
    
    if (!yearDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Current academic year document not found' },
        { status: 400 }
      );
    }
    
    const yearData = yearDoc.data();
    // Allow updating if the year parameter matches the current academic year ID, year, or displayName
    if (currentAcademicYearId !== year && yearData?.year !== year && yearData?.displayName !== year) {
      return NextResponse.json(
        { success: false, error: 'Year mismatch with current academic year' },
        { status: 400 }
      );
    }
    
    // Update the academic year document using the correct document ID
    const updateData: any = {
      admissionStatus: status,
      updatedAt: new Date(),
      updatedBy: userId
    };
    
    if (admissionStartDate) updateData.admissionStartDate = admissionStartDate;
    if (admissionEndDate) updateData.admissionEndDate = admissionEndDate;
    
    await yearRef.update(updateData);
    
    console.log('✅ Updated current academic year admission status in systemConfig-referenced document');
    
    console.log('✅ Admission status updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Admission status updated successfully'
    });
  } catch (error) {
    console.error('Error updating admission status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update admission status' },
      { status: 500 }
    );
  }
}

// PUT - Set current academic year
export async function PUT(request: NextRequest) {
    const adminDb = getDb();
  try {
    const body = await request.json();
    const { year, userId } = body;
    
    if (!year || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log(`🔄 Setting current academic year to ${year}...`);
    
    // Initialize Firebase Admin directly
    const { initializeApp, getApps, cert } = await import("firebase-admin/app");
    const { getFirestore } = await import("firebase-admin/firestore");
    
    // Load service account
    const fs = await import('fs');
    const path = await import('path');
    const serviceAccountPath = path.join(process.cwd(), 'ucaes2025-firebase-adminsdk-fbsvc-c70a08a455.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account not found at ${serviceAccountPath}`);
    }
    
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    // Create a new app instance
    const timestamp = Date.now();
    const appName = `put-admin-${timestamp}`;
    
    const app = initializeApp({
      credential: cert(serviceAccount),
      databaseURL: "https://ucaes2025-default-rtdb.firebaseio.com",
      projectId: serviceAccount.project_id
    }, appName);
    
    const adminDb = getFirestore(app);
    
    // Get the academic year document to get its display name
    const yearRef = adminDb.collection('academic-years').doc(year);
    const yearDoc = await yearRef.get();
    
    if (!yearDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Academic year not found' },
        { status: 404 }
      );
    }
    
    const yearData = yearDoc.data();
    
    // Update the systemConfig with the new current year
    const systemConfigRef = adminDb.collection('systemConfig').doc('academicPeriod');
    await systemConfigRef.set({
      currentAcademicYearId: year,
      currentAcademicYear: yearData?.displayName || yearData?.year || year,
      currentSemesterId: null, // Can be set later if needed
      currentSemester: null,
      lastUpdated: new Date(),
      updatedBy: userId
    }, { merge: true });
    
    console.log('✅ SystemConfig updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Current academic year updated successfully'
    });
  } catch (error) {
    console.error('Error setting current academic year:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to set current academic year' },
      { status: 500 }
    );
  }
}

