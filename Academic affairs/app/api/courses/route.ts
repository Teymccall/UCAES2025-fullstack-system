import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course, Program, AuditLog } from '@/lib/models';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check for query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    const level = searchParams.get('level');
    const semester = searchParams.get('semester');
    const programId = searchParams.get('program');
    
    // Build query
    let query: any = {};
    if (status) query.status = status;
    if (department) query.department = department;
    if (level) query.level = parseInt(level);
    if (semester) query.semester = parseInt(semester);
    if (programId && mongoose.Types.ObjectId.isValid(programId)) {
      query.programs = programId;
    }
    
    const courses = await Course.find(query).sort({ code: 1 }).lean();
    
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['code', 'name', 'credits', 'level', 'semester', 'faculty', 'department', 'academicYear'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if course already exists
    const existingCourse = await Course.findOne({ code: data.code });
    
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this code already exists' },
        { status: 409 }
      );
    }
    
    // Check if programs exist if specified
    if (data.programs && data.programs.length > 0) {
      const validPrograms = await Program.find({
        _id: { $in: data.programs },
        status: 'active'
      });
      
      if (validPrograms.length !== data.programs.length) {
        return NextResponse.json(
          { error: 'One or more specified programs do not exist or are not active' },
          { status: 400 }
        );
      }
    }
    
    // Create new course
    const newCourse = new Course(data);
    await newCourse.save();
    
    // Log the action
    const auditLog = new AuditLog({
      action: 'COURSE_CREATED',
      entity: 'Course',
      entityId: newCourse._id.toString(),
      details: `Created course: ${newCourse.name} (${newCourse.code})`,
      status: 'success'
    });
    await auditLog.save();
    
    return NextResponse.json(
      { success: true, course: newCourse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
} 