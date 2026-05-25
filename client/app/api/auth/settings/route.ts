import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Progress from '@/models/Progress';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { age, height, weight, goal, level } = body;

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update fields
    if (age) user.age = Number(age);
    if (height) user.height = Number(height);
    if (weight) {
      user.weight = Number(weight);
      // Log new weight in progress history
      const progress = await Progress.findOne({ userId: user._id });
      if (progress) {
        progress.weightHistory.push({ weight: Number(weight), date: new Date() });
        await progress.save();
      }
    }
    if (goal) user.goal = goal;
    if (level) user.level = level;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json({
      message: 'Profile settings updated successfully',
      user: userObj,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
