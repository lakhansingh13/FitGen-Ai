'use client';
import { apiFetch } from '@/lib/api';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, User, Calendar, Ruler, Scale, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    height: '',
    weight: '',
    goal: 'muscle_gain',
    level: 'beginner',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#030408] min-h-screen text-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <Navbar />

      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 mt-10">
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
              <Activity className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-2xl tracking-wider text-white">
              FitGen <span className="text-neon-green">AI</span>
            </span>
          </Link>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white">Build Your AI Profile</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-neon-green hover:text-white transition-colors">
            Sign In here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel py-8 px-6 sm:px-10 rounded-[32px] border border-white/5"
        >
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Grid layout for structured form inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Rivera"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="alex@domain.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age (years)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    name="age"
                    type="number"
                    required
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                </div>
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Height (cm)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Ruler className="w-4 h-4" />
                  </span>
                  <input
                    name="height"
                    type="number"
                    required
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="175"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <Scale className="w-4 h-4" />
                  </span>
                  <input
                    name="weight"
                    type="number"
                    required
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="70"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                </div>
              </div>

              {/* Fitness Goal */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fitness Goal</label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white appearance-none cursor-pointer"
                >
                  <option value="muscle_gain">💪 Muscle Gain</option>
                  <option value="weight_loss">🔥 Weight Loss</option>
                  <option value="strength">🏋️ Strength Training</option>
                  <option value="cardio">🏃 Cardio / Endurance</option>
                  <option value="yoga">🧘 Yoga & Flexibility</option>
                </select>
              </div>

              {/* Fitness Level */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fitness Experience</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-green/50 text-white appearance-none cursor-pointer"
                >
                  <option value="beginner">🟢 Beginner (New to exercise)</option>
                  <option value="intermediate">🔵 Intermediate (Can execute form rules)</option>
                  <option value="advanced">🔴 Advanced (Athletic builder)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Build My Profile'}
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 text-center border-t border-white/5 pt-4">
            <ShieldCheck className="w-4 h-4 text-neon-green" />
            <span>Secure account protected with bcrypt hashing.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
