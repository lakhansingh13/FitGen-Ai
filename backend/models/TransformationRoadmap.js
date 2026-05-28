import mongoose from 'mongoose';

const WeeklyRoadmapSchema = new mongoose.Schema({
  week: { type: Number, required: true },
  focus: { type: String, required: true },
  milestone: { type: String, required: true },
  dailyCalorieTarget: { type: Number, required: true },
  dailyProteinTarget: { type: Number, required: true },
  exerciseFrequency: { type: String, required: true }
});

const TransformationRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  goal: { type: String, required: true },
  timeline: { type: String, required: true },
  targetPhysique: { type: String },
  budget: { type: String },
  workoutPreference: { type: String },
  dietPreference: { type: String },
  weeklyRoadmap: [WeeklyRoadmapSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.TransformationRoadmap || mongoose.model('TransformationRoadmap', TransformationRoadmapSchema);
