import { NextRequest, NextResponse } from 'next/server'
import { walletService } from '@/lib/wallet-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 EMERGENCY: Cleanup duplicate transactions requested');
    
    // This is an emergency endpoint - use with caution
    const result = await walletService.cleanupDuplicateTransactions();
    
    console.log('✅ Cleanup completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Duplicate transactions cleaned up successfully',
      result
    });
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to cleanup duplicate transactions',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Getting transaction statistics');
    
    const stats = await walletService.getTransactionStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Failed to get stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get transaction statistics',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
