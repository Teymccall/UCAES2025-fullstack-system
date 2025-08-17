import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';
import { transferApprovedAdmissionToStudentPortal } from '@/lib/student-transfer-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const adminDb = getDb();
    console.log('🔄 Updating application status for:', params.applicationId);
    
    const body = await request.json();
    console.log('📥 Request body received:', body);
    const { applicationStatus, reviewNotes, directorApprovedProgram, directorApprovedLevel } = body;
    
    if (!applicationStatus) {
      return NextResponse.json(
        { success: false, error: 'Application status is required' },
        { status: 400 }
      );
    }
    
    // Valid status values
    const validStatuses = ['submitted', 'under_review', 'accepted', 'rejected'];
    if (!validStatuses.includes(applicationStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application status' },
        { status: 400 }
      );
    }
    
    // Find application by applicationId field (not document ID)
    let applicationDoc;
    try {
      const applicationsRef = adminDb.collection('admission-applications');
      console.log('🔍 Searching for application with ID:', params.applicationId);
      
      // First, try to find by applicationId field
      const querySnapshot = await applicationsRef
        .where('applicationId', '==', params.applicationId)
        .get();
      
      console.log('📊 Query result: found', querySnapshot.docs.length, 'documents by applicationId field');
      
      if (querySnapshot.empty) {
        console.log('⚠️ No application found with applicationId field, trying document ID...');
        
        // Fallback: try to find by document ID directly
        try {
          const docRef = applicationsRef.doc(params.applicationId);
          const docSnap = await docRef.get();
          
          if (docSnap.exists) {
            console.log('✅ Found application by document ID:', params.applicationId);
            applicationDoc = docSnap;
          } else {
            console.log('❌ No application found by document ID either:', params.applicationId);
            return NextResponse.json(
              { success: false, error: 'Application not found' },
              { status: 404 }
            );
          }
        } catch (docError) {
          console.error('❌ Error fetching by document ID:', docError);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Application not found',
              details: 'No application found with the provided ID'
            },
            { status: 404 }
          );
        }
      } else {
        applicationDoc = querySnapshot.docs[0];
        console.log('📄 Found application document:', applicationDoc.id);
      }
    } catch (queryError) {
      console.error('❌ Error querying Firebase:', queryError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database query failed',
          details: queryError instanceof Error ? queryError.message : 'Unknown query error'
        },
        { status: 500 }
      );
    }
    
    // Update the application status
    const updateData: any = {
      applicationStatus,
      updatedAt: new Date().toISOString(),
      lastReviewedBy: 'director', // In a real app, this would be the authenticated user
      lastReviewedAt: new Date().toISOString()
    };
    
    if (reviewNotes) {
      updateData.reviewNotes = reviewNotes;
    }
    
    // Include director's program and level selections for accepted applications
    if (applicationStatus === 'accepted') {
      if (directorApprovedProgram && directorApprovedProgram.trim() !== '') {
        updateData.directorApprovedProgram = directorApprovedProgram;
        // Update the programSelection.firstChoice to reflect director's decision
        updateData['programSelection.firstChoice'] = directorApprovedProgram;
      }
      if (directorApprovedLevel && directorApprovedLevel.trim() !== '') {
        updateData.directorApprovedLevel = directorApprovedLevel;
        // Update the programSelection.studyLevel to reflect director's decision  
        updateData['programSelection.studyLevel'] = directorApprovedLevel;
      }
    }
    
    // Update the application document
    try {
      console.log('💾 Updating application with data:', updateData);
      await applicationDoc.ref.update(updateData);
      console.log('✅ Application status updated successfully');
    } catch (updateError) {
      console.error('❌ Error updating Firebase document:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update application',
          details: updateError instanceof Error ? updateError.message : 'Unknown update error'
        },
        { status: 500 }
      );
    }
    
    // If application is accepted, automatically transfer to student portal
    let transferResult = null;
    if (applicationStatus === 'accepted') {
      console.log('🚀 Application accepted - initiating transfer to student portal...');
      try {
        transferResult = await transferApprovedAdmissionToStudentPortal(params.applicationId);
        if (transferResult.success) {
          console.log(`✅ Student successfully transferred to portal with registration number: ${transferResult.registrationNumber}`);
        } else {
          console.log(`⚠️ Transfer failed: ${transferResult.error}`);
        }
      } catch (transferError) {
        console.error('❌ Error during automatic transfer:', transferError);
        // Don't fail the status update if transfer fails
      }
    }
    
    const responseData: any = {
      success: true,
      message: 'Application status updated successfully',
      applicationId: params.applicationId,
      newStatus: applicationStatus
    };
    
    // Include transfer information if transfer was attempted
    if (transferResult) {
      responseData.transfer = {
        success: transferResult.success,
        registrationNumber: transferResult.registrationNumber,
        error: transferResult.error
      };
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      applicationId: params.applicationId
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update application status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    console.log('🔍 Fetching single application:', params.applicationId);
    
    // Get Firebase database instance
    const adminDb = getDb();
    if (!adminDb) {
      console.error('❌ Firebase Admin not initialized');
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Find application by applicationId field (not document ID)
    const applicationsRef = adminDb.collection('admission-applications');
    let doc;
    
    // First, try to find by applicationId field
    const querySnapshot = await applicationsRef
      .where('applicationId', '==', params.applicationId)
      .get();
    
    if (querySnapshot.empty) {
      console.log('⚠️ No application found with applicationId field, trying document ID...');
      
      // Fallback: try to find by document ID directly
      try {
        const docRef = applicationsRef.doc(params.applicationId);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
          console.log('✅ Found application by document ID:', params.applicationId);
          doc = docSnap;
        } else {
          console.log('❌ No application found by document ID either:', params.applicationId);
          return NextResponse.json(
            { success: false, error: 'Application not found' },
            { status: 404 }
          );
        }
      } catch (docError) {
        console.error('❌ Error fetching by document ID:', docError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Application not found',
            details: 'No application found with the provided ID'
          },
          { status: 404 }
        );
      }
    } else {
      doc = querySnapshot.docs[0];
      console.log('📄 Found application document:', doc.id);
    }
    const data = doc.data();
    
    const application = {
      id: doc.id,
      applicationId: data.applicationId || `PENDING-${doc.id.substring(0, 8)}`,
      firstName: data.personalInfo?.firstName || '',
      lastName: data.personalInfo?.lastName || '',
      email: data.contactInfo?.email || '',
      phone: data.contactInfo?.phone || '',
      program: data.programSelection?.program || '',
      firstChoice: data.programSelection?.firstChoice || '',
      secondChoice: data.programSelection?.secondChoice || '',
      programType: data.programSelection?.programType || '',
      level: data.programSelection?.level || '',
      studyMode: data.programSelection?.studyMode || '',
      applicationStatus: data.applicationStatus || 'submitted',
      paymentStatus: data.paymentStatus || 'pending',
      submittedAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : '',
      updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : '',
      reviewNotes: data.reviewNotes || '',
      lastReviewedBy: data.lastReviewedBy || '',
      lastReviewedAt: data.lastReviewedAt || '',
      personalInfo: data.personalInfo || {},
      contactInfo: data.contactInfo || {},
      academicBackground: data.academicBackground || {},
      programSelection: data.programSelection || {},
      documents: data.documents || {},
      documentUrls: {
        idDocument: data.documents?.idDocument?.url || '',
        certificate: data.documents?.certificate?.url || '',
        transcript: data.documents?.transcript?.url || '',
        photo: data.documents?.photo?.url || ''
      }
    };
    
    console.log('✅ Single application fetched successfully');
    
    return NextResponse.json({
      success: true,
      application
    });
    
  } catch (error) {
    console.error('❌ Error fetching single application:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

