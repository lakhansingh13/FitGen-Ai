import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
  },
  age: {
    type: Number,
    default: 25,
  },
  height: {
    type: Number, // in cm
    default: 170,
  },
  weight: {
    type: Number, // in kg
    default: 70,
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'strength', 'cardio', 'yoga'],
    default: 'muscle_gain',
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  xp: {
    type: Number,
    default: 0,
  },
  levelNumber: {
    type: Number,
    default: 1,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
