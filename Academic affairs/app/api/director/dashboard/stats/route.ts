import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  try {
    const { userId } = getAuth(req as any);
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // In a real application, you would fetch these stats from your database.
    // For now, we return mock data.
    const mockStats = {
      totalStudents: 0,
      pendingRegistrations: 0,
      pendingResults: 0,
      averageCGPA: 0,
    };

    return NextResponse.json({ success: true, stats: mockStats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching dashboard stats.' },
      { status: 500 }
    );
  }
} 