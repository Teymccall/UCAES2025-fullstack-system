import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Course, Program, AuditLog } from '@/lib/models';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { programId, academicYear, semester, level, courses } = await req.json();

    // Basic validation
    if (!programId || !academicYear || !semester || !level || !courses || !Array.isArray(courses)) {
      return NextResponse.json({ error: 'Missing or invalid parameters' }, { status: 400 });
    }
    
    const program = await Program.findById(programId);
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const createdCourses = [];
    const errors = [];

    for (const courseData of courses) {
      try {
        const { code, name, credits } = courseData;
        if (!code || !name || !credits) {
          errors.push({ course: courseData, error: 'Missing required course fields (code, name, credits)' });
          continue;
        }
        
        const existingCourse = await Course.findOne({ code, academicYear });
        if (existingCourse) {
           // If course exists, update it by adding the new program to its list
           if (!existingCourse.programs.includes(programId)) {
            existingCourse.programs.push(programId);
            await existingCourse.save();
          }
          createdCourses.push(existingCourse);

        } else {
          // Create new course
          const newCourse = new Course({
            ...courseData,
            academicYear,
            semester,
            level,
            programs: [programId],
            // Assuming faculty and department can be derived from the program
            faculty: program.faculty,
            department: program.department,
          });
          await newCourse.save();
          createdCourses.push(newCourse);
        }
      } catch (e) {
        errors.push({ course: courseData, error: e.message });
      }
    }
    
    if (errors.length > 0) {
        return NextResponse.json({ success: false, message: "Some courses could not be created", createdCourses, errors }, { status: 207 });
    }

    return NextResponse.json({ success: true, message: 'Courses added successfully', createdCourses }, { status: 201 });

  } catch (error) {
    console.error('Error in bulk-add-courses:', error);
    return NextResponse.json({ error: 'Failed to add courses' }, { status: 500 });
  }
} 