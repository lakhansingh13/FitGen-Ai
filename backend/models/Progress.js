import mongoose from 'mongoose';

const WeightLogSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const CaloriesLogSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const WorkoutLogSchema = new mongoose.Schema({
  workoutName: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const WaterLogSchema = new mongoose.Schema({
  glasses: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  weightHistory: [WeightLogSchema],
  caloriesBurnedHistory: [CaloriesLogSchema],
  workoutCompletionHistory: [WorkoutLogSchema],
  waterHistory: [WaterLogSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.Progress || mongoose.model('Progress', ProgressSchema);
