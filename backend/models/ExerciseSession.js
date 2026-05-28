import mongoose from 'mongoose';

const ExerciseSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  exerciseType: {
    type: String,
    enum: ['squat', 'pushup'],
    required: true,
  },
  repCount: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number, // in seconds
    required: true,
  },
  caloriesBurned: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.ExerciseSession || mongoose.model('ExerciseSession', ExerciseSessionSchema);
