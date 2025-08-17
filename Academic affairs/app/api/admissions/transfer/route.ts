import { NextRequest, NextResponse } from 'next/server';
import { transferApprovedAdmissionToStudentPortal, getTransferStatus } from '@/lib/student-transfer-service';

/**
 * POST /api/admissions/transfer
 * Transfer an approved admission application to the student portal
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Transfer API endpoint called');
    
    const body = await request.json();
    const { applicationId } = body;
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`📋 Processing transfer for application: ${applicationId}`);
    
    // Execute the transfer
    const result = await transferApprovedAdmissionToStudentPortal(applicationId);
    
    if (result.success) {
      console.log(`✅ Transfer successful for application ${applicationId}`);
      return NextResponse.json({
        success: true,
        message: 'Student successfully transferred to portal',
        registrationNumber: result.registrationNumber
      });
    } else {
      console.log(`❌ Transfer failed for application ${applicationId}: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error in transfer API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during transfer' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admissions/transfer?applicationId=...
 * Check transfer status for an application
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Checking transfer status for application: ${applicationId}`);
    
    const status = await getTransferStatus(applicationId);
    
    return NextResponse.json({
      success: true,
      ...status
    });
    
  } catch (error) {
    console.error('❌ Error checking transfer status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

