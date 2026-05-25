import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Progress from '@/models/Progress';
import ExerciseSession from '@/models/ExerciseSession';
import Achievement from '@/models/Achievement';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
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

    let progress = await Progress.findOne({ userId: user._id });
    if (!progress) {
      // Create default
      progress = await Progress.create({
        userId: user._id,
        weightHistory: [{ weight: user.weight, date: new Date() }],
        caloriesBurnedHistory: [],
        workoutCompletionHistory: [],
        waterHistory: [],
      });
    }

    // Unlocked achievements
    const achievements = await Achievement.find({ userId: user._id });

    // Latest exercise sessions
    const exerciseSessions = await ExerciseSession.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      user,
      progress,
      achievements,
      exerciseSessions,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Progress GET Error:', error);
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

    let progress = await Progress.findOne({ userId: user._id });
    if (!progress) {
      progress = await Progress.create({
        userId: user._id,
        weightHistory: [{ weight: user.weight, date: new Date() }],
        caloriesBurnedHistory: [],
        workoutCompletionHistory: [],
        waterHistory: [],
      });
    }

    const body = await req.json();
    const { type, weight, glasses, workoutName, calories, exerciseType, reps, duration } = body;

    let xpGained = 0;
    let unlockedBadge = null;

    if (type === 'weight' && weight) {
      // Add weight entry
      progress.weightHistory.push({ weight: Number(weight), date: new Date() });
      user.weight = Number(weight); // update current weight
      xpGained = 50; // 50 XP for updating weight
      await progress.save();
    } 
    
    else if (type === 'water' && glasses) {
      // Add water entry
      progress.waterHistory.push({ glasses: Number(glasses), date: new Date() });
      xpGained = 10; // 10 XP for logging hydration
      await progress.save();
    } 
    
    else if (type === 'workout' && workoutName && calories) {
      // Add completed workout
      progress.workoutCompletionHistory.push({ workoutName, date: new Date() });
      progress.caloriesBurnedHistory.push({ calories: Number(calories), date: new Date() });
      xpGained = 150; // 150 XP for full workout completion
      
      // Update streak
      const today = new Date();
      const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
      if (lastActiveDate) {
        const diffTime = Math.abs(today.getTime() - lastActiveDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          user.streak += 1;
        } else if (diffDays > 1) {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }
      user.lastActive = today;
      await progress.save();
    } 
    
    else if (type === 'pose_session' && exerciseType && reps && duration && calories) {
      // Create pose session log
      await ExerciseSession.create({
        userId: user._id,
        exerciseType,
        repCount: Number(reps),
        duration: Number(duration),
        caloriesBurned: Number(calories),
      });

      // Add calorie progress
      progress.caloriesBurnedHistory.push({ calories: Number(calories), date: new Date() });
      progress.workoutCompletionHistory.push({ workoutName: `AI Pose Trainer: ${exerciseType}s`, date: new Date() });
      xpGained = Number(reps) * 5; // 5 XP per rep
      await progress.save();
    }

    // Award XP and check level ups
    user.xp += xpGained;
    const requiredXp = user.levelNumber * 1000;
    if (user.xp >= requiredXp) {
      user.levelNumber += 1;
      user.xp = user.xp - requiredXp; // carry over
      
      // Level Up Achievement
      try {
        const badge = await Achievement.create({
          userId: user._id,
          badgeId: `level_${user.levelNumber}`,
          title: `Elite Level ${user.levelNumber}`,
          description: `Reached Level ${user.levelNumber} on the FitGen AI platform!`,
        });
        unlockedBadge = badge.title;
      } catch (achieveErr) {
        // Achievement already exists
      }
    }

    // Check specific milestone achievements
    // 1. First Workout Achievement
    if (progress.workoutCompletionHistory.length === 1) {
      try {
        const badge = await Achievement.create({
          userId: user._id,
          badgeId: 'first_workout',
          title: 'First Step taken',
          description: 'Completed your very first workout plan!',
        });
        unlockedBadge = badge.title;
      } catch (e) {}
    }

    // 2. Streak Master Achievement
    if (user.streak >= 3) {
      try {
        const badge = await Achievement.create({
          userId: user._id,
          badgeId: 'streak_3',
          title: 'Streak Master',
          description: 'Maintained a workout streak of 3 days!',
        });
        unlockedBadge = badge.title;
      } catch (e) {}
    }

    // 3. Hydration Hero Achievement
    if (progress.waterHistory.length >= 5) {
      try {
        const badge = await Achievement.create({
          userId: user._id,
          badgeId: 'hydration_hero',
          title: 'Hydration Hero',
          description: 'Logged water intake 5 times!',
        });
        unlockedBadge = badge.title;
      } catch (e) {}
    }

    await user.save();

    return NextResponse.json({
      message: 'Progress saved successfully',
      xpGained,
      userLevel: user.levelNumber,
      userStreak: user.streak,
      unlockedBadge,
      progress
    }, { status: 200 });

  } catch (error: any) {
    console.error('Progress POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
