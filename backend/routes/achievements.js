import express from 'express';
import Achievement from '../models/Achievement.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/achievements
router.get('/', protect, async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id }).sort({ unlockedAt: -1 });
    return res.json({ achievements });
  } catch (error) {
    console.error('Achievements GET Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
