import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Add CORS headers helper
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }));
}

export async function POST(request: NextRequest) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      const errorResponse = NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Fetch application data from Firebase
    const admissionsRef = collection(db, 'admission-applications');
    const q = query(admissionsRef, where('applicationId', '==', applicationId));
    const querySnapshot = await getDocs(q);

    let applicationData;
    
    if (querySnapshot.empty) {
      console.log('⚠️ No application found with applicationId, trying document ID...');
      
      // Fallback: try searching by document ID
      const docRef = doc(db, 'admission-applications', applicationId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ Found application by document ID');
        applicationData = docSnap.data();
      } else {
        console.log('❌ Application not found by document ID either');
        const errorResponse = NextResponse.json(
          { error: 'Application not found' },
          { status: 404 }
        );
        return addCorsHeaders(errorResponse);
      }
    } else {
      applicationData = querySnapshot.docs[0].data();
    }

    // Check if application is approved
    if (applicationData.applicationStatus !== 'accepted') {
      const errorResponse = NextResponse.json(
        { error: 'Application must be approved before generating admission letter' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse);
    }

    // Create simple PDF
    console.log('📄 Creating PDF document...');
    const doc = new jsPDF();
    
    // Add UCAES header
    doc.setFontSize(20);
    doc.text('UNIVERSITY COLLEGE OF AGRICULTURE', 105, 30, { align: 'center' });
    doc.text('& ENVIRONMENTAL STUDIES (UCAES)', 105, 40, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('ADMISSION LETTER', 105, 60, { align: 'center' });
    
    // Student details
    doc.setFontSize(12);
    const name = `${applicationData.personalInfo?.firstName || ''} ${applicationData.personalInfo?.lastName || ''}`.trim();
    const program = applicationData.programSelection?.firstChoice || 'Unknown Program';
    
    doc.text(`Application ID: ${applicationId}`, 20, 80);
    doc.text(`Student Name: ${name}`, 20, 95);
    doc.text(`Program: ${program}`, 20, 110);
    doc.text(`Status: ACCEPTED`, 20, 125);
    
    doc.text('Congratulations! You have been admitted to UCAES.', 20, 145);
    doc.text('Please report to the admissions office for further instructions.', 20, 160);
    
    // Date
    const today = new Date().toLocaleDateString();
    doc.text(`Date: ${today}`, 20, 200);
    
    // Generate PDF buffer
    console.log('💾 Generating PDF buffer...');
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="UCAES_Simple_Admission_Letter_${applicationId}.pdf"`);
    headers.set('Content-Length', pdfBuffer.length.toString());

    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: headers,
    });
    
    return addCorsHeaders(response);

  } catch (error) {
    console.error('Error generating simple admission letter:', error);
    const errorResponse = NextResponse.json(
      { error: 'Failed to generate admission letter', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse);
  }
}




























