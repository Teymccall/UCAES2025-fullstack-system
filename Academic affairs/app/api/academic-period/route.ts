import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AcademicYear, Semester } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get the active academic year
    const activeYear = await AcademicYear.findOne({ status: 'active' }).lean();
    
    if (!activeYear) {
      return NextResponse.json(
        { error: 'No active academic year found' },
        { status: 404 }
      );
    }
    
    // Get the active semester for this academic year
    const activeSemester = await Semester.findOne({
      academicYear: activeYear.year,
      status: 'active'
    }).lean();
    
    // Return the academic period
    return NextResponse.json({
      academicYear: activeYear.year,
      semester: activeSemester ? activeSemester.name : 'Not set',
      semesterNumber: activeSemester ? activeSemester.number : null,
      yearId: activeYear._id,
      semesterId: activeSemester ? activeSemester._id : null
    });
  } catch (error) {
    console.error('Error fetching academic period:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic period' },
      { status: 500 }
    );
  }
} 