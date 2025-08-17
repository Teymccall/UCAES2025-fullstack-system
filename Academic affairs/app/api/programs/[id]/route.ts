import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Program, AuditLog } from '@/lib/models';
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
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }
    
    const program = await Program.findById(id).lean();
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ program });
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
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
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }
    
    // Find program
    const program = await Program.findById(id);
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Check if name or code is being updated and if it would cause a conflict
    if ((data.name && data.name !== program.name) || (data.code && data.code !== program.code)) {
      const conflictingProgram = await Program.findOne({
        _id: { $ne: id },
        $or: [
          { name: data.name || program.name },
          { code: data.code || program.code }
        ]
      });
      
      if (conflictingProgram) {
        return NextResponse.json(
          { error: 'Another program with this name or code already exists' },
          { status: 409 }
        );
      }
    }
    
    // Update program
    Object.assign(program, data);
    await program.save();
    
    // Log the action
    const auditLog = new AuditLog({
      action: 'PROGRAM_UPDATED',
      entity: 'Program',
      entityId: program._id.toString(),
      details: `Updated program: ${program.name} (${program.code})`,
      status: 'success'
    });
    await auditLog.save();
    
    return NextResponse.json({ success: true, program });
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
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
        { error: 'Invalid program ID' },
        { status: 400 }
      );
    }
    
    // Find program
    const program = await Program.findById(id);
    
    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }
    
    // Instead of hard deleting, mark as inactive
    program.status = 'discontinued';
    await program.save();
    
    // Log the action
    const auditLog = new AuditLog({
      action: 'PROGRAM_DISCONTINUED',
      entity: 'Program',
      entityId: program._id.toString(),
      details: `Discontinued program: ${program.name} (${program.code})`,
      status: 'success'
    });
    await auditLog.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error discontinuing program:', error);
    return NextResponse.json(
      { error: 'Failed to discontinue program' },
      { status: 500 }
    );
  }
} 