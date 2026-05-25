import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Progress from '@/models/Progress';
import { hashPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, password, age, height, weight, goal, level } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age: Number(age) || 25,
      height: Number(height) || 170,
      weight: Number(weight) || 70,
      goal: goal || 'muscle_gain',
      level: level || 'beginner',
      xp: 0,
      levelNumber: 1,
      streak: 0,
      lastActive: new Date(),
    });

    // Create default Progress record for the user
    await Progress.create({
      userId: user._id,
      weightHistory: [{ weight: Number(weight) || 70, date: new Date() }],
      caloriesBurnedHistory: [],
      workoutCompletionHistory: [],
      waterHistory: [],
    });

    // Create JWT
    const token = signToken({ userId: user._id.toString(), email: user.email });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    return NextResponse.json(
      { message: 'Registration successful', user: userObj },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
