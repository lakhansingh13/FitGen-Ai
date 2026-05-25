import mongoose from 'mongoose';

const DietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetCalories: {
    type: Number,
    required: true,
  },
  meals: {
    breakfast: { type: String, required: true },
    lunch: { type: String, required: true },
    dinner: { type: String, required: true },
    snacks: { type: String, required: true },
  },
  waterTarget: {
    type: Number, // in glasses (e.g. 8)
    default: 8,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.DietPlan || mongoose.model('DietPlan', DietPlanSchema);
