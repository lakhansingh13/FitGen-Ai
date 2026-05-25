'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import { Activity, Settings, User, Sparkles, Check } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    goal: 'muscle_gain',
    level: 'beginner',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          const { name, email, age, height, weight, goal, level } = data.user;
          setFormData({
            name,
            email,
            age: age?.toString() || '',
            height: height?.toString() || '',
            weight: weight?.toString() || '',
            goal: goal || 'muscle_gain',
            level: level || 'beginner',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: Number(formData.age),
          height: Number(formData.height),
          weight: Number(formData.weight),
          goal: formData.goal,
          level: formData.level,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setMessage('FitGen AI user profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 z-10 relative">
        {/* Glow Blur */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-green/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Review credentials, update biological scales, or switch active fitness goals.</p>
        </header>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-neon-green">
            <Activity className="w-10 h-10 animate-spin" />
            <span className="ml-3 font-bold">Scanning profile configurations...</span>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 bg-white/2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name (ReadOnly) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Account Name</label>
                    <input
                      type="text"
                      disabled
                      value={formData.name}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Email (ReadOnly) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Registered Email</label>
                    <input
                      type="text"
                      disabled
                      value={formData.email}
                      className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Age (years)</label>
                    <input
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                    />
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Height (cm)</label>
                    <input
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Weight (kg)</label>
                    <input
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                    />
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fitness Goal</label>
                    <select
                      name="goal"
                      value={formData.goal}
                      onChange={handleChange}
                      className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 text-white appearance-none cursor-pointer"
                    >
                      <option value="muscle_gain">💪 Muscle Gain</option>
                      <option value="weight_loss">🔥 Weight Loss</option>
                      <option value="strength">🏋️ Strength Training</option>
                      <option value="cardio">🏃 Cardio / Endurance</option>
                      <option value="yoga">🧘 Yoga & Flexibility</option>
                    </select>
                  </div>

                  {/* Level */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fitness Experience</label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 text-white appearance-none cursor-pointer"
                    >
                      <option value="beginner">🟢 Beginner</option>
                      <option value="intermediate">🔵 Intermediate</option>
                      <option value="advanced">🔴 Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-6 py-3 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-colors cursor-pointer text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(57,255,20,0.15)]"
                  >
                    <Settings className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
                    {updating ? 'Committing Changes...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
