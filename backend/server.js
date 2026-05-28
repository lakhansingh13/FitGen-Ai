import './config/env.js';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import workoutRoutes from './routes/workout.js';
import dietRoutes from './routes/diet.js';
import achievementsRoutes from './routes/achievements.js';
import chatRoutes from './routes/chat.js';
import transformationRoutes from './routes/transformation.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// CORS configuration
let allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins = allowedOrigins.concat(process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()));
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(cookieParser());

// Serve uploads statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/transformation', transformationRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'FitGen AI Backend is running smoothly.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
