import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import ExerciseSession from '../models/ExerciseSession.js';
import Achievement from '../models/Achievement.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/progress
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

    const achievements = await Achievement.find({ userId: user._id });
    const exerciseSessions = await ExerciseSession.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    return res.json({
      user,
      progress,
      achievements,
      exerciseSessions,
    });
  } catch (error) {
    console.error('Progress GET Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   POST /api/progress
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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

    const { type, weight, glasses, workoutName, calories, exerciseType, reps, duration } = req.body;

    let xpGained = 0;
    let unlockedBadge = null;

    if (type === 'weight' && weight) {
      progress.weightHistory.push({ weight: Number(weight), date: new Date() });
      user.weight = Number(weight);
      xpGained = 50;
      await progress.save();
    } 
    
    else if (type === 'water' && glasses) {
      progress.waterHistory.push({ glasses: Number(glasses), date: new Date() });
      xpGained = 10;
      await progress.save();
    } 
    
    else if (type === 'workout' && workoutName && calories) {
      progress.workoutCompletionHistory.push({ workoutName, date: new Date() });
      progress.caloriesBurnedHistory.push({ calories: Number(calories), date: new Date() });
      xpGained = 150;
      
      // Update workout streak
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
      await ExerciseSession.create({
        userId: user._id,
        exerciseType,
        repCount: Number(reps),
        duration: Number(duration),
        caloriesBurned: Number(calories),
      });

      progress.caloriesBurnedHistory.push({ calories: Number(calories), date: new Date() });
      progress.workoutCompletionHistory.push({ workoutName: `AI Pose Trainer: ${exerciseType}s`, date: new Date() });
      xpGained = Number(reps) * 5;
      
      // Also increment workout streak if it's the first activity of the day
      const today = new Date();
      const lastActiveDate = user.lastActive ? new Date(user.lastActive) : null;
      if (!lastActiveDate || today.toDateString() !== lastActiveDate.toDateString()) {
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
      }

      await progress.save();
    }

    // Award XP and check level ups
    user.xp += xpGained;
    const requiredXp = user.levelNumber * 1000;
    if (user.xp >= requiredXp) {
      user.levelNumber += 1;
      user.xp = user.xp - requiredXp;
      
      // Level Up Achievement
      try {
        const badge = await Achievement.create({
          userId: user._id,
          badgeId: `level_${user.levelNumber}`,
          title: `Elite Level ${user.levelNumber}`,
          description: `Reached Level ${user.levelNumber} on the FitGen AI platform!`,
        });
        unlockedBadge = badge.title;
      } catch (e) {}
    }

    // Check specific milestone achievements
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

    return res.json({
      message: 'Progress saved successfully',
      xpGained,
      userLevel: user.levelNumber,
      userStreak: user.streak,
      unlockedBadge,
      progress
    });
  } catch (error) {
    console.error('Progress POST Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
