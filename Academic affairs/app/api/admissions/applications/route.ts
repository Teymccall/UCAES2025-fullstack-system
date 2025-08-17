import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    const adminDb = getDb();
    console.log('📡 APPLICATIONS API: Fetching admissions applications');
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const program = searchParams.get('program');
    const searchTerm = searchParams.get('search');
    
    console.log('🔍 Query parameters:', { status, paymentStatus, program, searchTerm });
    
    // Build query using Firebase Admin SDK
    const admissionAppsRef = adminDb.collection('admission-applications');
    let firestoreQuery = admissionAppsRef.orderBy('createdAt', 'desc');
    
    if (status) {
      firestoreQuery = admissionAppsRef.where('applicationStatus', '==', status).orderBy('createdAt', 'desc');
    }
    
    if (paymentStatus) {
      firestoreQuery = admissionAppsRef.where('paymentStatus', '==', paymentStatus).orderBy('createdAt', 'desc');
    }
    
    if (program) {
      firestoreQuery = admissionAppsRef.where('programSelection.program', '==', program).orderBy('createdAt', 'desc');
    }
    
    // Get documents
    console.log('📋 Executing Firestore query...');
    const snapshot = await firestoreQuery.get();
    console.log(`📊 Found ${snapshot.docs.length} documents in Firestore`);
    
    let applications = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 Processing document:', doc.id, data);
      
      // Enhanced mapping to handle multiple data structures
      // Some applications store data differently, so we need to check multiple possible locations
      
      const getPersonalInfo = () => {
        // Try different possible structures for personal info
        if (data.personalInfo) return data.personalInfo;
        // If no nested structure, check if data is stored directly at root level
        return {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          dateOfBirth: data.dateOfBirth || '',
          nationality: data.nationality || '',
          gender: data.gender || '',
          region: data.region || ''
        };
      };
      
      const getContactInfo = () => {
        // Try different possible structures for contact info
        if (data.contactInfo) return data.contactInfo;
        // If no nested structure, check if data is stored directly at root level
        return {
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || ''
        };
      };
      
      const personalInfo = getPersonalInfo();
      const contactInfo = getContactInfo();
      
      // Map data to expected format for Academic Affairs with all required fields
      const academicBackground = data.academicBackground || {};
      const programSelection = data.programSelection || {};
      const documents = data.documents || {};
      
      return {
        id: doc.id,
        applicationId: data.applicationId || doc.id,
        
        // Personal Information (flattened for director view)
        firstName: personalInfo.firstName || '',
        lastName: personalInfo.lastName || '',
        dateOfBirth: personalInfo.dateOfBirth || '',
        nationality: personalInfo.nationality || '',
        gender: personalInfo.gender || '',
        region: personalInfo.region || '',
        
        // Contact Information (flattened for director view)
        email: contactInfo.email || '',
        phone: contactInfo.phone || '',
        address: contactInfo.address || '',
        emergencyContact: contactInfo.emergencyContact || '',
        emergencyPhone: contactInfo.emergencyPhone || '',
        
        // Application Status
        applicationStatus: data.applicationStatus || 'submitted', // Default to submitted for director review
        status: data.applicationStatus || 'submitted', // Alias for backward compatibility
        paymentStatus: data.paymentStatus || 'pending',
        
        // Program Selection - handle multiple possible structures
        programType: programSelection.applicationType || programSelection.programType || data.programType || '',
        studyLevel: programSelection.studyLevel || programSelection.level || data.studyLevel || '',
        studyMode: programSelection.studyMode || data.studyMode || '',
        firstChoice: programSelection.firstChoice || programSelection.program || data.firstChoice || '',
        secondChoice: programSelection.secondChoice || data.secondChoice || '',
        
        // Academic Background (flattened for director view)
        schoolName: academicBackground.schoolName || '',
        qualificationType: academicBackground.qualificationType || '',
        yearCompleted: academicBackground.yearCompleted || '',
        subjects: academicBackground.subjects || [],
        
        // Top-up specific fields
        previousQualification: programSelection.previousQualification || data.previousQualification || '',
        previousProgram: academicBackground.qualificationType || data.previousProgram || '', 
        previousInstitution: academicBackground.schoolName || data.previousInstitution || '', 
        previousYearCompleted: academicBackground.yearCompleted || data.previousYearCompleted || '', 
        creditTransfer: programSelection.creditTransfer || data.creditTransfer || 0,
        
        // Documents (with proper URL mapping)
        documents: documents,
        documentUrls: {
          idDocument: documents.idDocument?.url || documents.idDocument || '',
          certificate: documents.certificate?.url || documents.certificate || '',
          transcript: documents.transcript?.url || documents.transcript || '',
          photo: documents.photo?.url || documents.photo || ''
        },
        
        // Timestamps (properly formatted)
        submittedAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : '',
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
        
        // Review fields
        reviewNotes: data.reviewNotes || '',
        directorApprovedProgram: data.directorApprovedProgram || '',
        directorApprovedLevel: data.directorApprovedLevel || '',
        lastReviewedBy: data.lastReviewedBy || '',
        lastReviewedAt: data.lastReviewedAt || '',
        
        // Legacy fields for backward compatibility
        academicBackground: academicBackground,
        contactDetails: data.contactDetails || contactInfo
      };
    });
    
    // Apply client-side search if needed
    if (searchTerm) {
      console.log(`🔎 Applying search filter for: "${searchTerm}"`);
      const searchLower = searchTerm.toLowerCase();
      applications = applications.filter(app => 
        app.firstName.toLowerCase().includes(searchLower) ||
        app.lastName.toLowerCase().includes(searchLower) ||
        app.email.toLowerCase().includes(searchLower) ||
        app.applicationId.toLowerCase().includes(searchLower) ||
        app.firstChoice.toLowerCase().includes(searchLower)
      );
    }
    
    console.log(`✅ Returning ${applications.length} applications after filtering`);
    
    return NextResponse.json({
      success: true,
      applications,
      total: applications.length,
      debug: {
        originalCount: snapshot.docs.length,
        filteredCount: applications.length,
        filters: { status, paymentStatus, program, searchTerm }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch applications',
        details: error.message,
        applications: []
      },
      { status: 500 }
    );
  }
}