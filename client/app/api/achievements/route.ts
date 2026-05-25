import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Achievement from '@/models/Achievement';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const achievements = await Achievement.find({ userId: payload.userId }).sort({ unlockedAt: -1 });

    return NextResponse.json({ achievements }, { status: 200 });
  } catch (error: any) {
    console.error('Achievements GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
