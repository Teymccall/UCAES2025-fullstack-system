import { NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const adminDb = getDb();
    console.log('🔍 Testing academic years collection query...');
    
    // Test the exact query from the main API
    console.log('🔍 Fetching all academic years...');
    const yearsCollection = adminDb.collection('academic-years');
    const yearsSnapshot = await yearsCollection.get();
    
    console.log('✅ Years snapshot retrieved');
    console.log('📊 Number of documents:', yearsSnapshot.docs.length);
    
    const availableYears = yearsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        year: data.year || '',
        displayName: data.displayName || data.year || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        admissionStatus: data.admissionStatus || 'closed',
      };
    });
    
    console.log('✅ Years mapped successfully');
    console.log('📊 Available years:', availableYears);
    
    // Test sorting
    availableYears.sort((a, b) => b.year.localeCompare(a.year));
    console.log('✅ Years sorted successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Academic years query test successful',
      count: availableYears.length,
      years: availableYears
    });
    
  } catch (error) {
    console.error('❌ Academic years query test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 });
  }
}
