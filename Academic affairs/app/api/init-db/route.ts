import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/initialize-db';

export async function POST() {
  try {
    await initializeDatabase();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
