import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fitgen-ai-super-secret-key-change-in-production';

// Sign token utility
const signToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

// Set token cookie utility
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// @route   POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, age, height, weight, goal, level } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age: Number(age) || 25,
      height: Number(height) || 170,
      weight: Number(weight) || 70,
      goal: goal || 'muscle_gain',
      level: level || 'beginner'
    });

    const token = signToken(user._id.toString(), user.email);
    setTokenCookie(res, token);

    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ message: 'User created successfully', user: userObj });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    user.lastActive = new Date();
    await user.save();

    const token = signToken(user._id.toString(), user.email);
    setTokenCookie(res, token);

    const userObj = user.toObject();
    delete userObj.password;

    return res.json({ message: 'Login successful', user: userObj });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// @route   POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
  return res.json({ message: 'Logged out successfully' });
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('Me Auth Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// @route   POST /api/auth/settings
router.post('/settings', protect, async (req, res) => {
  try {
    const { age, height, weight, goal, level } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (age !== undefined) user.age = Number(age);
    if (height !== undefined) user.height = Number(height);
    if (weight !== undefined) user.weight = Number(weight);
    if (goal !== undefined) user.goal = goal;
    if (level !== undefined) user.level = level;

    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    return res.json({ message: 'Settings updated successfully', user: userObj });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
