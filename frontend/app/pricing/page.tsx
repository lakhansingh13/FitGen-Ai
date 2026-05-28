'use client';

import Navbar from '@/components/Navbar';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="bg-[#030408] min-h-screen text-gray-100 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-32 flex-1 flex flex-col gap-12 z-10 relative w-full">
        {/* Glow blurs */}
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-neon-blue/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col gap-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            Choose Your <span className="text-gradient-neon">Pace</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Begin with our entry-level models or unlock full real-time camera tracking features. Cancel or downgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Base */}
          <div className="glass-panel rounded-3xl p-8 border border-white/5 bg-white/2 flex flex-col gap-6">
            <div>
              <h3 className="font-extrabold text-xl text-white">Base Tier</h3>
              <p className="text-gray-500 text-xs mt-1">For exploring smart exercise recommendations.</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white">$0</span>
              <span className="text-gray-400 text-xs">/ month</span>
            </div>
            <hr className="border-white/10" />
            <ul className="flex-1 space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">✓ AI workout generator (3/mo)</li>
              <li className="flex items-center gap-2">✓ AI diet recommendation (3/mo)</li>
              <li className="flex items-center gap-2">✓ Floating Chatbot support</li>
              <li className="flex items-center gap-2">✓ Basic progress & water logs</li>
            </ul>
            <Link
              href="/signup"
              className="w-full text-center py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-white font-bold transition-all"
            >
              Sign Up Free
            </Link>
          </div>

          {/* Pro */}
          <div className="glass-panel rounded-3xl p-8 border border-neon-green/30 bg-white/2 flex flex-col gap-6 relative overflow-hidden shadow-[0_0_30px_rgba(57,255,20,0.04)]">
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-neon-green text-black font-extrabold text-[9px] uppercase tracking-wider">
              Recommended
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white">Premium Pro</h3>
              <p className="text-gray-500 text-xs mt-1">For elite forms tracking and unlimited generations.</p>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-extrabold text-white">$19</span>
              <span className="text-gray-400 text-xs">/ month</span>
            </div>
            <hr className="border-white/10" />
            <ul className="flex-1 space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2 text-neon-green">
                <Sparkles className="w-3.5 h-3.5 fill-neon-green" />
                Live Camera Pose Correction
              </li>
              <li className="flex items-center gap-2 text-neon-green">
                <Sparkles className="w-3.5 h-3.5 fill-neon-green" />
                Automatic Pushup & Squat Counter
              </li>
              <li className="flex items-center gap-2">✓ Unlimited AI Workout generation</li>
              <li className="flex items-center gap-2">✓ Unlimited AI Diet plan scheduling</li>
              <li className="flex items-center gap-2">✓ Extended Recharts history graphs</li>
              <li className="flex items-center gap-2">✓ Priority badge levels unlocking</li>
            </ul>
            <Link
              href="/signup"
              className="w-full text-center py-3 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all cursor-pointer"
            >
              Unlock Premium Pro
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 px-6 text-center text-xs text-gray-500 bg-[#030408]">
        &copy; {new Date().getFullYear()} FitGen AI. All rights reserved. Secure payment gateways.
      </footer>
    </div>
  );
}
