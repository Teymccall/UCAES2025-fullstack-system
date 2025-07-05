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

    // In a real application, you would fetch recent activities from your database.
    // For now, we return an empty array.
    const mockActivities = [];

    return NextResponse.json({ success: true, activities: mockActivities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching recent activities.' },
      { status: 500 }
    );
  }
} 