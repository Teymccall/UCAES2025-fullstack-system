import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Program } from '@/lib/models';
import { AuditLog } from '@/lib/models';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check for query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');
    
    // Build query
    let query: any = {};
    if (status) query.status = status;
    if (department) query.department = department;
    
    const programs = await Program.find(query).sort({ name: 1 }).lean();
    
    return NextResponse.json({ programs });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'code', 'department', 'faculty', 'type', 'durationYears', 'credits'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Check if program already exists
    const existingProgram = await Program.findOne({
      $or: [
        { name: data.name },
        { code: data.code }
      ]
    });
    
    if (existingProgram) {
      return NextResponse.json(
        { error: 'Program with this name or code already exists' },
        { status: 409 }
      );
    }
    
    // Create new program
    const newProgram = new Program(data);
    await newProgram.save();
    
    // Log the action
    const auditLog = new AuditLog({
      action: 'PROGRAM_CREATED',
      entity: 'Program',
      entityId: newProgram._id.toString(),
      details: `Created program: ${newProgram.name} (${newProgram.code})`,
      status: 'success'
    });
    await auditLog.save();
    
    return NextResponse.json(
      { success: true, program: newProgram },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
} 