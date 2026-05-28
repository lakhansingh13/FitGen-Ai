import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  restTime: { type: String, default: "60s" }
});

const DayScheduleSchema = new mongoose.Schema({
  day: { type: String, required: true },
  focus: { type: String, required: true },
  exercises: [ExerciseSchema]
});

const WorkoutPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weeklySchedule: [DayScheduleSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.WorkoutPlan || mongoose.model('WorkoutPlan', WorkoutPlanSchema);
