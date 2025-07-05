import { NextRequest, NextResponse } from 'next/server';
import { getAcademicYears } from '@/lib/academic-year-utils';

// Server-side implementation for fallback academic years
function generateServerFallbackYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  // Generate academic years from 2010 to current+2
  for (let year = 2010; year <= currentYear + 2; year++) {
    years.push(`${year}/${year + 1}`);
  }
  
  // Sort with most recent first
  return years.sort((a, b) => {
    const yearA = parseInt(a.split('/')[0]);
    const yearB = parseInt(b.split('/')[0]);
    return yearB - yearA;
  });
}

/**
 * GET /api/academic-years
 * Fetch all academic years from the database
 */
export async function GET(request: NextRequest) {
  try {
    // Generate fallback years first to ensure we always have something to return
    const fallbackYears = generateServerFallbackYears();
    
    try {
      // Try to get academic years from Firestore
      const academicYears = await getAcademicYears().catch(() => null);
      
      // If we have years from Firestore, use them
      if (academicYears && academicYears.length > 0) {
        console.log(`API: Returning ${academicYears.length} total academic years`);
        return NextResponse.json(academicYears, { status: 200 });
      }
      
      // If no years from Firestore, use fallback
      console.log('API: No years found in database, using fallback years');
      return NextResponse.json(fallbackYears, { status: 200 });
    } catch (dbError) {
      // If database error, use fallback
      console.error('API: Database error fetching academic years:', dbError);
      console.log('API: Using fallback years');
      return NextResponse.json(fallbackYears, { status: 200 });
    }
  } catch (error) {
    // If any other error, return error response with fallback years
    console.error('API: Critical error in academic years endpoint:', error);
    
    // Even in case of error, try to return fallback years
    try {
      const emergencyFallback = generateServerFallbackYears();
      return NextResponse.json(emergencyFallback, { 
        status: 200,
        headers: { 'X-Error': 'Used emergency fallback due to error' }
      });
    } catch (fallbackError) {
      // If even fallback generation fails, return a minimal set of years
      const currentYear = new Date().getFullYear();
      const minimalFallback = [
        `${currentYear}/${currentYear + 1}`,
        `${currentYear - 1}/${currentYear}`,
        `${currentYear - 2}/${currentYear - 1}`
      ];
      
      return NextResponse.json(minimalFallback, { 
        status: 200,
        headers: { 'X-Error': 'Used minimal fallback due to critical error' }
      });
    }
  }
} 