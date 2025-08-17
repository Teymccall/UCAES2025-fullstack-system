import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AcademicYear, AuditLog } from '@/lib/models';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all academic years from the 'academicyears' collection
    const academicYears = await AcademicYear.find({}).sort({ year: -1 });
    
    return NextResponse.json({ academicYears });
  } catch (error: any) {
    console.error('Failed to fetch academic years:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic years', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { year, startDate, endDate, status } = body;

    if (!year || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newAcademicYear = new AcademicYear({
      year,
      startDate,
      endDate,
      status: status || 'upcoming',
    });

    await newAcademicYear.save();

    return NextResponse.json({ success: true, academicYear: newAcademicYear }, { status: 201 });

  } catch (error: any) {
    console.error('Failed to create academic year:', error);
    return NextResponse.json(
      { error: 'Failed to create academic year', details: error.message },
      { status: 500 }
    );
  }
} 