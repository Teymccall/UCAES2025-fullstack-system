import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '@/lib/models/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, name, email, password, role } = body;
    
    if (!username || !name || !email || !password) {
      return NextResponse.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }
    
    // Connect to the database (this will initialize mongoose connection)
    await connectToDatabase();
    
    // Check if username or email already exists using mongoose model
    const existingUser = await User.findOne({ 
      $or: [ { username }, { email } ] 
    });
    
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Username or email already exists.' }, { status: 409 });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user using mongoose model
    const newUser = new User({
      uid: uuidv4(),
      username,
      name,
      email,
      password: hashedPassword,
      role: role || 'director',
      department: 'Academic Affairs',
      position: 'Academic Director',
      permissions: [
        'full_access', 'staff_management', 'course_management', 'student_management',
        'result_management', 'academic_management', 'system_settings', 'audit_trail'
      ],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save the user to the database
    await newUser.save();
    
    // Return success response (excluding password)
    return NextResponse.json({ 
      success: true, 
      user: { 
        username, 
        name, 
        email, 
        role: newUser.role 
      } 
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ success: false, error: 'Signup failed.' }, { status: 500 });
  }
}
