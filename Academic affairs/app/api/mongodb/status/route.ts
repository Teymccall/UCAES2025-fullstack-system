import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // The connectToDatabase function now handles the connection logic and throws an error if it fails.
    // If it completes without an error, the connection is successful.
    await connectToDatabase();
    
    return NextResponse.json({ connected: true, message: 'Database connection successful.' });
  } catch (error: any) {
    console.error('MongoDB status check failed:', error);
    return NextResponse.json(
      { connected: false, error: 'Database connection failed', details: error.message },
      { status: 500 }
    );
  }
} 