import { NextRequest, NextResponse } from 'next/server';
import { syncAdmissionStatusToSystemConfig } from '@/lib/system-config';

// POST - Sync admission status from academic year to system config
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual sync of admission status requested...');
    
    const result = await syncAdmissionStatusToSystemConfig();
    
    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Admission status synced successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to sync admission status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error in sync endpoint:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}





