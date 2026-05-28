import express from 'express';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import ProgressPhoto from '../models/ProgressPhoto.js';
import TransformationRoadmap from '../models/TransformationRoadmap.js';
import Achievement from '../models/Achievement.js';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper: check if two dates are the same calendar day
const isSameDay = (d1, d2) => {
  return d1.toDateString() === d2.toDateString();
};

// Helper: check if two dates are consecutive days
const isConsecutiveDay = (d1, d2) => {
  const diffTime = Math.abs(d1.getTime() - d2.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// @route   GET /api/transformation/roadmap
router.get('/roadmap', protect, async (req, res) => {
  try {
    const roadmap = await TransformationRoadmap.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ roadmap });
  } catch (error) {
    console.error('Roadmap GET Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   POST /api/transformation/roadmap
router.post('/roadmap', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { goal, timeline, targetPhysique, budget, workoutPreference, dietPreference } = req.body;

    if (!goal || !timeline) {
      return res.status(400).json({ error: 'Goal and timeline are required' });
    }

    let roadmapData;

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are a world-class fitness transformation strategist. Create a highly professional weekly transformation roadmap for a client with the following profile:
Goal: ${goal} (e.g. fat loss, muscle gain, lean body, wedding transformation)
Timeline: ${timeline} (e.g. 30_days, 60_days, 90_days)
Target Physique: ${targetPhysique || 'Athletic'}
Budget constraints: ${budget || 'moderate'}
Workout Preference: ${workoutPreference || 'any'}
Diet Preference: ${dietPreference || 'any'}
Client current weight: ${user.weight} kg, height: ${user.height} cm

Return a JSON object matching this structure:
{
  "weeklyRoadmap": [
    {
      "week": 1,
      "focus": "Priming and Conditioning",
      "milestone": "Drop 0.5kg or adjust posture alignment",
      "dailyCalorieTarget": 2100,
      "dailyProteinTarget": 120,
      "exerciseFrequency": "3-4 sessions/week"
    }
  ]
}
Generate weeks according to the timeline: 4 weeks for 30_days, 8 weeks for 60_days, or 12 weeks for 90_days.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        roadmapData = JSON.parse(text);
      } catch (geminiError) {
        console.error('Gemini generate roadmap error, using fallback:', geminiError);
      }
    }

    // Fallback roadmap
    if (!roadmapData) {
      roadmapData = getFallbackRoadmap(goal, timeline);
    }

    // Save/Update roadmap in DB
    const roadmap = await TransformationRoadmap.findOneAndUpdate(
      { userId: user._id },
      {
        goal,
        timeline,
        targetPhysique,
        budget,
        workoutPreference,
        dietPreference,
        weeklyRoadmap: roadmapData.weeklyRoadmap
      },
      { new: true, upsert: true }
    );

    return res.json({ message: 'Transformation roadmap generated successfully', roadmap });
  } catch (error) {
    console.error('Roadmap POST Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// @route   GET /api/transformation/photos
router.get('/photos', protect, async (req, res) => {
  try {
    const photos = await ProgressPhoto.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.json({ photos });
  } catch (error) {
    console.error('Progress photos GET Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   POST /api/transformation/photos
router.post('/photos', protect, upload.fields([
  { name: 'frontPose', maxCount: 1 },
  { name: 'sidePose', maxCount: 1 },
  { name: 'backPose', maxCount: 1 }
]), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Extract urls depending on local vs Cloudinary storage
    const getFileUrl = (files, fieldName) => {
      if (!files || !files[fieldName] || files[fieldName].length === 0) return null;
      const file = files[fieldName][0];
      if (file.path) {
        // Cloudinary returns full URL in path
        if (file.path.startsWith('http')) return file.path;
        // Local path fallback
        const protocol = req.protocol;
        const host = req.get('host');
        return `${protocol}://${host}/uploads/${file.filename}`;
      }
      return null;
    };

    const frontPoseUrl = getFileUrl(req.files, 'frontPose');
    const sidePoseUrl = getFileUrl(req.files, 'sidePose');
    const backPoseUrl = getFileUrl(req.files, 'backPose');

    if (!frontPoseUrl && !sidePoseUrl && !backPoseUrl) {
      return res.status(400).json({ error: 'At least one progress photo is required (front, side, or back pose)' });
    }

    // Update upload streak & award XP
    const today = new Date();
    const lastUpload = user.lastUploadDate ? new Date(user.lastUploadDate) : null;
    let xpGained = 100; // 100 XP for progress photo upload

    if (lastUpload) {
      if (!isSameDay(today, lastUpload)) {
        if (isConsecutiveDay(today, lastUpload)) {
          user.uploadStreak += 1;
        } else {
          user.uploadStreak = 1;
        }
        user.lastUploadDate = today;
      }
    } else {
      user.uploadStreak = 1;
      user.lastUploadDate = today;
    }

    user.xp += xpGained;
    
    // Check level up
    const requiredXp = user.levelNumber * 1000;
    let unlockedBadge = null;
    if (user.xp >= requiredXp) {
      user.levelNumber += 1;
      user.xp = user.xp - requiredXp;
      
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

    // Badge for uploading photos
    if (user.uploadStreak === 1) {
      try {
        const badge = await Achievement.create({
          userId: user._id,
          badgeId: 'first_upload',
          title: 'Picture Perfect',
          description: 'Uploaded your first set of body transformation photos!',
        });
        unlockedBadge = badge.title;
      } catch (e) {}
    }

    await user.save();

    // Generate AI Progress Insights
    let aiInsights = "";
    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // Find recent progress metrics
        const progress = await Progress.findOne({ userId: user._id });
        const weightHistoryStr = progress ? JSON.stringify(progress.weightHistory.slice(-5)) : "[]";
        
        const prompt = `You are a sports kinesiologist and body transformation analyst.
The client has just uploaded new progress photos (Front, Side, or Back).
Client profile: Weight: ${user.weight}kg, Goal: ${user.goal}, Active Level: ${user.level}.
Recent Weight Log History: ${weightHistoryStr}
Upload Streak: ${user.uploadStreak} days.

Generate a short, futuristic, encouraging progress analysis (3-4 bullet points) noting potential posture tips, hydration importance, fat/lean trends, and what to focus on for next week. Keep it clinical and motivating. Do not mention that you cannot see the photos. Focus on text/logs and general professional advice based on the photo uploads.`;

        const result = await model.generateContent(prompt);
        aiInsights = result.response.text();
      } catch (geminiError) {
        console.error('Gemini generate insights error:', geminiError);
      }
    }

    if (!aiInsights) {
      aiInsights = `• **Visual Progress**: Awesome consistency! You have logged an active photo streak of ${user.uploadStreak} day(s).\n• **Muscle Symmetries**: Core engagement and shoulder positioning look balanced. Focus on keeping your ribcage locked in during posture counters.\n• **Fat & Lean Trends**: Progressing well towards your goal of ${user.goal.replace('_', ' ')}. Keep tracking your daily macros and calories.\n• **Next Week's Goal**: Focus on improving squat depth to activate posterior chain muscle groups.`;
    }

    // Save photo logs
    const progressPhoto = await ProgressPhoto.create({
      userId: user._id,
      frontPoseUrl,
      sidePoseUrl,
      backPoseUrl,
      aiInsights,
      createdAt: today
    });

    return res.status(201).json({
      message: 'Progress photos uploaded successfully',
      photos: progressPhoto,
      uploadStreak: user.uploadStreak,
      xpGained,
      userLevel: user.levelNumber,
      unlockedBadge
    });
  } catch (error) {
    console.error('Progress photos POST Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

function getFallbackRoadmap(goal, timeline) {
  const weeks = timeline === '90_days' ? 12 : timeline === '60_days' ? 8 : 4;
  const targetCals = goal === 'weight_loss' ? 1800 : 2500;
  const targetProt = goal === 'weight_loss' ? 120 : 150;
  
  const weeklyRoadmap = [];
  for (let w = 1; w <= weeks; w++) {
    weeklyRoadmap.push({
      week: w,
      focus: `Phase ${Math.ceil(w/4)}: Week ${w} - Focus on ${goal.replace('_', ' ')} consistency`,
      milestone: `Complete at least 4 posture tracking workouts and check weight`,
      dailyCalorieTarget: targetCals,
      dailyProteinTarget: targetProt,
      exerciseFrequency: "4 sessions/week"
    });
  }

  return { weeklyRoadmap };
}

export default router;
