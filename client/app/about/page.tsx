'use client';

import Navbar from '@/components/Navbar';
import { Activity, ShieldCheck, Heart, UserCheck } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="bg-[#030408] min-h-screen text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-32 flex-1 flex flex-col gap-12 z-10 relative">
        {/* Glow blur */}
        <div className="absolute top-40 left-10 w-[300px] h-[300px] bg-neon-green/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            The Mission of <span className="text-gradient-neon">FitGen AI</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Pioneering the future of fitness by combining state-of-the-art computer vision models with Large Language Model dietitians.
          </p>
        </div>

        <hr className="border-white/5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/2">
            <h3 className="text-white font-extrabold text-lg flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-neon-green" />
              Computer Vision Form Correction
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We leverage real-time joint-angle tracking powered by MediaPipe Pose models on OpenCV streams. By calculating specific vector angles at the elbow, hip, and knee, our system validates squat depth and back straightness, giving live instructions and counting repetitions.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-white/2">
            <h3 className="text-white font-extrabold text-lg flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-neon-blue" />
              Generative Health Systems
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every body is unique. By integrating the Google Gemini API, we tailor complete weekly exercise tables and daily Indian macro meal lists specific to your age, goal, height, and weight to ensure clean and active habits.
            </p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/2 text-center flex flex-col items-center gap-6">
          <Heart className="w-12 h-12 text-red-500 fill-red-500/20 animate-pulse" />
          <h3 className="font-extrabold text-xl text-white">Ready to change your form?</h3>
          <p className="text-gray-400 text-sm max-w-md">
            Join thousands of active athletes leveling up their physical potential using computer-aided feedback.
          </p>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-full bg-neon-green text-black font-extrabold hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.15)]"
          >
            Start For Free
          </Link>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 px-6 text-center text-xs text-gray-500 bg-[#030408]">
        &copy; {new Date().getFullYear()} FitGen AI. All rights reserved. Secure computer-vision analysis.
      </footer>
    </div>
  );
}
