import mongoose from 'mongoose';

const ProgressPhotoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  frontPoseUrl: { type: String },
  sidePoseUrl: { type: String },
  backPoseUrl: { type: String },
  aiInsights: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.ProgressPhoto || mongoose.model('ProgressPhoto', ProgressPhotoSchema);
