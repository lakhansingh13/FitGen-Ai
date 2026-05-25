'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import { Activity, Scale, Award, Trash, ChevronRight, Check } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface User {
  _id: string;
  name: string;
  weight: number;
  height: number;
  xp: number;
  streak: number;
}

interface Achievement {
  badgeId: string;
  title: string;
  description: string;
  unlockedAt: string;
}

interface LoggedItem {
  weight?: number;
  calories?: number;
  date: string;
}

export default function ProgressAnalytics() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [weightLogs, setWeightLogs] = useState<LoggedItem[]>([]);
  const [calorieLogs, setCalorieLogs] = useState<LoggedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingWeight, setSubmittingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAchievements(data.achievements || []);
        
        // Format chart logs
        const wHistory = data.progress?.weightHistory?.map((w: any) => ({
          weight: w.weight,
          date: new Date(w.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        })) || [];
        setWeightLogs(wHistory);

        const cHistory = data.progress?.caloriesBurnedHistory?.map((c: any) => ({
          calories: c.calories,
          date: new Date(c.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        })) || [];
        setCalorieLogs(cHistory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) return;

    setSubmittingWeight(true);
    setSuccessMsg('');
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weight', weight: Number(newWeight) }),
      });
      if (res.ok) {
        setNewWeight('');
        setSuccessMsg('Weight logged and Profile updated! +50 XP Gained.');
        fetchProgress();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingWeight(false);
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
          <h1 className="text-3xl font-extrabold text-white tracking-wide">Progress Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Track body transformations, verify active calorie burning, and inspect earned badges.</p>
        </header>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-neon-green">
            <Activity className="w-10 h-10 animate-spin" />
            <span className="ml-3 font-bold">Retrieving progress charts...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top row: Weight submit + metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Log Weight */}
              <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-white/2 to-transparent flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2 mb-2">
                    <Scale className="w-5 h-5 text-neon-green" />
                    Log Weight
                  </h3>
                  <p className="text-xs text-gray-400">Regular logs feed into your baseline charts.</p>
                </div>

                <form onSubmit={handleWeightSubmit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="e.g. 71.5"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-green/50 text-white"
                  />
                  <button
                    type="submit"
                    disabled={submittingWeight}
                    className="px-4 py-2 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white text-xs transition-colors cursor-pointer"
                  >
                    {submittingWeight ? 'Saving...' : 'Submit'}
                  </button>
                </form>
              </div>

              {/* Weight Change Metric */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Weight</p>
                  <h3 className="text-3xl font-extrabold text-white mt-2">
                    {user?.weight} <span className="text-sm text-gray-400 font-medium">kg</span>
                  </h3>
                </div>
                <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3 mt-4">
                  Goal target is synced to user settings.
                </div>
              </div>

              {/* Streak Multiplier */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Streaks</p>
                  <h3 className="text-3xl font-extrabold text-neon-green mt-2">
                    🔥 {user?.streak} <span className="text-sm text-gray-400 font-medium">Days</span>
                  </h3>
                </div>
                <div className="text-[10px] text-gray-500 border-t border-white/5 pt-3 mt-4 text-neon-green font-bold">
                  Sustain streaks for XP multipliers!
                </div>
              </div>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Log Graph */}
              <div className="glass-panel rounded-2xl p-5 min-h-[280px] flex flex-col">
                <h3 className="font-extrabold text-sm text-white mb-4">Bodyweight Timeline (kg)</h3>
                <div className="flex-1 w-full min-h-[200px]">
                  {weightLogs.length < 2 ? (
                    <div className="flex h-full items-center justify-center text-xs text-gray-500">
                      Submit more weight entries to build curves.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weightLogs}>
                        <defs>
                          <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={10} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d141e', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <Area type="monotone" dataKey="weight" stroke="#00f0ff" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Calorie Burn Graph */}
              <div className="glass-panel rounded-2xl p-5 min-h-[280px] flex flex-col">
                <h3 className="font-extrabold text-sm text-white mb-4">Burned Calories Log (kcal)</h3>
                <div className="flex-1 w-full min-h-[200px]">
                  {calorieLogs.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-xs text-gray-500">
                      Calorie burn curve compiles when webcam sessions end.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calorieLogs}>
                        <XAxis dataKey="date" stroke="#4b5563" fontSize={10} tickLine={false} />
                        <YAxis stroke="#4b5563" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#0d141e', border: '1px solid rgba(255,255,255,0.08)' }} />
                        <Line type="monotone" dataKey="calories" stroke="#39ff14" strokeWidth={2.5} dot={{ stroke: '#39ff14', strokeWidth: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements Grid */}
            <div className="glass-panel rounded-3xl p-6 border border-white/5">
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-neon-green" />
                <h3 className="font-extrabold text-base text-white">Unlocked Achievements</h3>
              </div>

              {achievements.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 leading-relaxed">
                  Earn XP by logging water, weights, and completing posture cameras sessions to unlock badges!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {achievements.map((badge, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-neon-green/5 border border-neon-green/20 flex gap-3.5 items-start"
                    >
                      <div className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green shrink-0">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white uppercase tracking-wider">{badge.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{badge.description}</p>
                        <span className="text-[9px] text-neon-green font-medium mt-2 block">
                          Unlocked: {new Date(badge.unlockedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
