import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WorkoutPlan from '@/models/WorkoutPlan';
import { getUserFromRequest } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function GET(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const plan = await WorkoutPlan.findOne({ userId: payload.userId });
    return NextResponse.json({ plan }, { status: 200 });
  } catch (error: any) {
    console.error('Workout GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { goal, level, weight, height } = user;

    let workoutData;

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are a professional personal trainer. Generate a detailed weekly workout plan for a user with the following profile:
Goal: ${goal}
Level: ${level}
Weight: ${weight} kg
Height: ${height} cm

Return a JSON object matching this structure:
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Chest & Triceps",
      "exercises": [
        { "name": "Bench Press", "sets": 4, "reps": "10-12", "restTime": "90s" }
      ]
    }
  ]
}
Provide a plan for Monday, Tuesday, Wednesday, Thursday, and Friday. Saturday and Sunday should be marked as rest/active recovery days.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        workoutData = JSON.parse(text);
      } catch (geminiError) {
        console.error('Gemini generate workout error, using fallback:', geminiError);
      }
    }

    // Fallback if Gemini key is missing or failed
    if (!workoutData) {
      workoutData = getFallbackWorkout(goal, level);
    }

    // Save or update plan in DB
    const plan = await WorkoutPlan.findOneAndUpdate(
      { userId: user._id },
      { weeklySchedule: workoutData.weeklySchedule },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: 'Workout plan generated successfully', plan }, { status: 200 });
  } catch (error: any) {
    console.error('Workout API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

function getFallbackWorkout(goal: string, level: string) {
  // Goal-based presets
  if (goal === 'weight_loss') {
    return {
      weeklySchedule: [
        {
          day: 'Monday',
          focus: 'HIIT & Core Burner',
          exercises: [
            { name: 'Jumping Jacks', sets: 3, reps: '45 sec', restTime: '30s' },
            { name: 'Bodyweight Squats', sets: 4, reps: '20 reps', restTime: '30s' },
            { name: 'Pushups', sets: 3, reps: '15 reps', restTime: '45s' },
            { name: 'Plank Hold', sets: 3, reps: '60 sec', restTime: '30s' },
            { name: 'Burpees', sets: 3, reps: '12 reps', restTime: '60s' }
          ]
        },
        {
          day: 'Tuesday',
          focus: 'Cardio Focus (Fat Loss)',
          exercises: [
            { name: 'High Knees', sets: 4, reps: '40 sec', restTime: '30s' },
            { name: 'Mountain Climbers', sets: 4, reps: '30 sec', restTime: '30s' },
            { name: 'Lunges (Alternating)', sets: 3, reps: '12 per leg', restTime: '45s' },
            { name: 'Bicycle Crunches', sets: 3, reps: '25 reps', restTime: '30s' },
            { name: 'Jump Rope', sets: 3, reps: '2 min', restTime: '60s' }
          ]
        },
        {
          day: 'Wednesday',
          focus: 'Active Recovery Yoga',
          exercises: [
            { name: 'Child\'s Pose', sets: 1, reps: '2 min', restTime: '0s' },
            { name: 'Downward Dog', sets: 3, reps: '60 sec', restTime: '15s' },
            { name: 'Warrior Pose I & II', sets: 3, reps: '45 sec each', restTime: '30s' },
            { name: 'Cobra Stretch', sets: 2, reps: '60 sec', restTime: '15s' }
          ]
        },
        {
          day: 'Thursday',
          focus: 'Lower Body Strength',
          exercises: [
            { name: 'Goblet Squats', sets: 4, reps: '15 reps', restTime: '45s' },
            { name: 'Glute Bridges', sets: 4, reps: '20 reps', restTime: '30s' },
            { name: 'Bulgarian Split Squats', sets: 3, reps: '10 per leg', restTime: '45s' },
            { name: 'Calf Raises', sets: 3, reps: '25 reps', restTime: '30s' }
          ]
        },
        {
          day: 'Friday',
          focus: 'Full Body Circuit',
          exercises: [
            { name: 'Dumbbell Thrusters', sets: 4, reps: '12 reps', restTime: '45s' },
            { name: 'Renegade Rows', sets: 3, reps: '10 per arm', restTime: '45s' },
            { name: 'Kettlebell Swings', sets: 4, reps: '15 reps', restTime: '45s' },
            { name: 'Flutter Kicks', sets: 3, reps: '45 sec', restTime: '30s' }
          ]
        },
        { day: 'Saturday', focus: 'Rest Day', exercises: [] },
        { day: 'Sunday', focus: 'Rest Day', exercises: [] }
      ]
    };
  } else {
    // Muscle Gain / Strength presets
    return {
      weeklySchedule: [
        {
          day: 'Monday',
          focus: 'Push Day (Chest, Shoulders & Triceps)',
          exercises: [
            { name: 'Dumbbell Press', sets: 4, reps: '10-12', restTime: '90s' },
            { name: 'Overhead Shoulder Press', sets: 4, reps: '10', restTime: '90s' },
            { name: 'Incline Dumbbell Flys', sets: 3, reps: '12', restTime: '75s' },
            { name: 'Lateral Raises', sets: 3, reps: '15', restTime: '60s' },
            { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12-15', restTime: '65s' }
          ]
        },
        {
          day: 'Tuesday',
          focus: 'Pull Day (Back & Biceps)',
          exercises: [
            { name: 'Pull Ups / Lat Pulldown', sets: 4, reps: '8-10', restTime: '90s' },
            { name: 'Bent Over Rows', sets: 4, reps: '10', restTime: '90s' },
            { name: 'Face Pulls', sets: 3, reps: '15', restTime: '60s' },
            { name: 'Incline Bicep Curls', sets: 3, reps: '12', restTime: '75s' },
            { name: 'Hammer Curls', sets: 3, reps: '12', restTime: '60s' }
          ]
        },
        { day: 'Wednesday', focus: 'Active Recovery & Stretching', exercises: [] },
        {
          day: 'Thursday',
          focus: 'Leg Day (Quads & Glutes)',
          exercises: [
            { name: 'Barbell Squats', sets: 4, reps: '8-10', restTime: '120s' },
            { name: 'Romanian Deadlifts', sets: 4, reps: '10', restTime: '90s' },
            { name: 'Leg Press', sets: 3, reps: '12', restTime: '90s' },
            { name: 'Leg Curls', sets: 3, reps: '15', restTime: '60s' },
            { name: 'Standing Calf Raises', sets: 4, reps: '15', restTime: '60s' }
          ]
        },
        {
          day: 'Friday',
          focus: 'Arm & Core Sculpt',
          exercises: [
            { name: 'Barbell Curls', sets: 3, reps: '10-12', restTime: '75s' },
            { name: 'Skull Crushers', sets: 3, reps: '10-12', restTime: '75s' },
            { name: 'Concentration Curls', sets: 3, reps: '12', restTime: '60s' },
            { name: 'Overhead Dumbbell Tricep Extension', sets: 3, reps: '12', restTime: '60s' },
            { name: 'Hanging Leg Raises', sets: 3, reps: '15', restTime: '45s' }
          ]
        },
        { day: 'Saturday', focus: 'Rest Day', exercises: [] },
        { day: 'Sunday', focus: 'Rest Day', exercises: [] }
      ]
    };
  }
}
