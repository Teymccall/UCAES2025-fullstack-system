import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '@/lib/models/user';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Username and password are required.' 
      }, { status: 400 });
    }
    
    // Connect to the database (this will initialize mongoose connection)
    await connectToDatabase();
    
    // Find the user by username using mongoose model
    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid username or password.' 
      }, { status: 401 });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid username or password.' 
      }, { status: 401 });
    }
    
    // Generate a session token
    const sessionToken = uuidv4();
    
    // Update user's session token in the database
    user.sessionToken = sessionToken;
    user.lastLogin = new Date();
    await user.save();
    
    // Return user data without sensitive information
    const userData = {
      uid: user.uid,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: user.permissions,
      sessionToken
    };
    
    return NextResponse.json({ 
      success: true, 
      user: userData
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Login failed.' 
    }, { status: 500 });
  }
} 