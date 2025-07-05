import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course, Program, AuditLog } from '@/lib/models';
import mongoose from 'mongoose';

// Helper to check if a string is a valid MongoDB ObjectId
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Check if ID is valid
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    const course = await Course.findById(id).lean();
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const data = await req.json();
    
    // Check if ID is valid
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Find course
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Check if code is being updated and if it would cause a conflict
    if (data.code && data.code !== course.code) {
      const conflictingCourse = await Course.findOne({
        _id: { $ne: id },
        code: data.code
      });
      
      if (conflictingCourse) {
        return NextResponse.json(
          { error: 'Another course with this code already exists' },
          { status: 409 }
        );
      }
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
    
    // Update course with deployment fields
    Object.assign(course, data);
    // Ensure status reflects deployment availability if provided
    if (data.status) {
      course.status = data.status;
    }
    // Add fields for academic year and semester availability if provided
    if (data.availableAcademicYear) {
      course.availableAcademicYear = data.availableAcademicYear;
    }
    if (data.availableSemester) {
      course.availableSemester = data.availableSemester;
    }
    await course.save();
    
    // Log the action
    const auditLog = new AuditLog({
      action: 'COURSE_UPDATED',
      entity: 'Course',
      entityId: course._id.toString(),
      details: `Updated course: ${course.name} (${course.code})` + (data.status ? `, Status: ${data.status}` : '') + (data.availableAcademicYear ? `, Available Year: ${data.availableAcademicYear}` : '') + (data.availableSemester ? `, Available Semester: ${data.availableSemester}` : ''),
      status: 'success'
    });
    await auditLog.save();
    
    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    // Check if ID is valid
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }
    
    // Find course
    const course = await Course.findById(id);
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Instead of hard deleting, mark as inactive
    course.status = 'discontinued';
    await course.save();
    
    // Log the action
    const auditLog = new AuditLog({
      action: 'COURSE_DISCONTINUED',
      entity: 'Course',
      entityId: course._id.toString(),
      details: `Discontinued course: ${course.name} (${course.code})`,
      status: 'success'
    });
    await auditLog.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error discontinuing course:', error);
    return NextResponse.json(
      { error: 'Failed to discontinue course' },
      { status: 500 }
    );
  }
} 