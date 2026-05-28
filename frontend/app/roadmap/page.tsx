'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import HeartbeatLoader from '@/components/HeartbeatLoader';
import { apiFetch } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Calendar,
  Flame,
  Zap,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Target
} from 'lucide-react';

interface WeeklyRoadmap {
  week: number;
  focus: string;
  milestone: string;
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  exerciseFrequency: string;
}

interface Roadmap {
  goal: string;
  timeline: string;
  targetPhysique: string;
  budget: string;
  workoutPreference: string;
  dietPreference: string;
  weeklyRoadmap: WeeklyRoadmap[];
}

export default function TransformationRoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form states
  const [goal, setGoal] = useState('muscle_gain');
  const [timeline, setTimeline] = useState('30_days');
  const [targetPhysique, setTargetPhysique] = useState('Athletic');
  const [budget, setBudget] = useState('moderate');
  const [workoutPreference, setWorkoutPreference] = useState('gym');
  const [dietPreference, setDietPreference] = useState('vegetarian');

  const fetchRoadmap = async () => {
    try {
      const res = await apiFetch('/api/transformation/roadmap');
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap) {
          setRoadmap(data.roadmap);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await apiFetch('/api/transformation/roadmap', {
        method: 'POST',
        body: JSON.stringify({
          goal,
          timeline,
          targetPhysique,
          budget,
          workoutPreference,
          dietPreference
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleReset = () => {
    setRoadmap(null);
  };

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto pl-14 pr-6 py-8 md:px-10 z-10 relative">
        {/* Neon Blur Background Glow */}
        <div className="absolute top-20 right-20 w-[450px] h-[450px] bg-neon-blue/2 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-neon-green/2 rounded-full blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-wide flex items-center gap-2">
            AI Transformation Roadmap
            <Sparkles className="w-6 h-6 text-neon-green animate-pulse" />
          </h1>
          <p className="text-sm text-gray-400 mt-1">Design a customized futuristic roadmap mapping your physique timeline and milestones.</p>
        </header>

        {loading ? (
          <div className="flex-1 h-[60vh] flex items-center justify-center">
            <HeartbeatLoader text="Decrypting Transformation Timelines..." />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!roadmap ? (
              /* Configuration Form */
              <motion.div
                key="config-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-3xl mx-auto"
              >
                {generating ? (
                  <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-white/5 min-h-[400px]">
                    <HeartbeatLoader text="Generating Weekly Milestones & Macro Targets..." />
                  </div>
                ) : (
                  <form onSubmit={handleGenerate} className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                      <Target className="w-5 h-5 text-neon-green" />
                      <h2 className="font-extrabold text-lg text-white">Configure Your Target Physique</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Goal Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transformation Goal</label>
                        <select
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 cursor-pointer"
                        >
                          <option value="weight_loss">📉 Extreme Weight Loss / Shredding</option>
                          <option value="muscle_gain">💪 Muscle Mass Hypertrophy</option>
                          <option value="lean_body">⚡ Lean & Athletic Physique</option>
                          <option value="wedding">💍 Wedding / Special Event Shred</option>
                        </select>
                      </div>

                      {/* Timeline selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Timeline Duration</label>
                        <select
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 cursor-pointer"
                        >
                          <option value="30_days">🔋 30-Day Blitz (4 Weeks)</option>
                          <option value="60_days">💎 60-Day Transformation (8 Weeks)</option>
                          <option value="90_days">👑 90-Day Complete Recomp (12 Weeks)</option>
                        </select>
                      </div>

                      {/* Physique preference */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target Physique Model</label>
                        <select
                          value={targetPhysique}
                          onChange={(e) => setTargetPhysique(e.target.value)}
                          className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 cursor-pointer"
                        >
                          <option value="Athletic">Runner / Lean Athleticism</option>
                          <option value="Aesthetic">Aesthetic V-Taper Physique</option>
                          <option value="Powerlifter">Bulk & Raw Strength Build</option>
                          <option value="Tone">Toned & Defined Body</option>
                        </select>
                      </div>

                      {/* Budget preferences */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Supplement / Diet Budget</label>
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 cursor-pointer"
                        >
                          <option value="low">Budget-Friendly (Staple Foods)</option>
                          <option value="moderate">Moderate (Includes basic protein powder)</option>
                          <option value="high">Premium (Includes isolate, creatine, vitamins)</option>
                        </select>
                      </div>

                      {/* Workout Preference */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workout Preference</label>
                        <select
                          value={workoutPreference}
                          onChange={(e) => setWorkoutPreference(e.target.value)}
                          className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 cursor-pointer"
                        >
                          <option value="gym">Gym Strength Training</option>
                          <option value="home">Home Bodyweight & Calisthenics</option>
                          <option value="hybrid">Hybrid (Weights + Cardio)</option>
                        </select>
                      </div>

                      {/* Diet preference */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dietary Orientation</label>
                        <select
                          value={dietPreference}
                          onChange={(e) => setDietPreference(e.target.value)}
                          className="w-full bg-[#0d141e]/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-neon-green/50 cursor-pointer"
                        >
                          <option value="vegetarian">Vegetarian (Paneer, Tofu, Dal)</option>
                          <option value="vegan">Vegan (Plant-Based Curds, Tofu, Soy)</option>
                          <option value="non_vegetarian">Non-Vegetarian (Eggs, Chicken, Fish)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 mt-4 bg-neon-green text-black font-extrabold rounded-2xl hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-center gap-2 cursor-pointer text-sm uppercase tracking-wider"
                    >
                      <Compass className="w-5 h-5 fill-black animate-spin-slow" />
                      Generate AI Transformation Strategy
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              /* Roadmap Roadmap details visual vertical timeline */
              <motion.div
                key="roadmap-timeline"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                {/* Roadmap Metadata Card */}
                <div className="glass-panel rounded-3xl p-6 border border-white/5 bg-gradient-to-r from-neon-green/5 to-neon-blue/5 flex flex-col md:flex-row justify-between md:items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-neon-green/5 rounded-full blur-2xl" />
                  
                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-1.5 capitalize">
                      Active Target: {roadmap.goal.replace('_', ' ')}
                      <span className="text-xs bg-neon-green/10 text-neon-green border border-neon-green/20 px-2 py-0.5 rounded font-bold uppercase">
                        {roadmap.timeline.replace('_', ' ')}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Physique: {roadmap.targetPhysique} | Diet: {roadmap.dietPreference} | Training: {roadmap.workoutPreference}
                    </p>
                  </div>

                  <button
                    onClick={handleReset}
                    className="self-start md:self-auto px-4 py-2 border border-white/10 hover:border-red-500/30 bg-white/5 hover:bg-red-500/10 text-xs text-gray-300 hover:text-red-400 font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Strategy
                  </button>
                </div>

                {/* Timeline container */}
                <div className="relative pl-6 sm:pl-8 border-l border-white/10 space-y-8 mt-8">
                  {roadmap.weeklyRoadmap.map((week, idx) => (
                    <motion.div
                      key={week.week}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group"
                    >
                      {/* Glowing Timeline Marker */}
                      <span className="absolute -left-12.5 sm:-left-14.5 top-0.5 w-6 h-6 rounded-full bg-[#030408] border-2 border-neon-green flex items-center justify-center text-[10px] font-black text-neon-green group-hover:border-neon-blue group-hover:text-neon-blue transition-all duration-300 shadow-[0_0_10px_rgba(57,255,20,0.4)] group-hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]">
                        {week.week}
                      </span>

                      {/* Card Content */}
                      <div className="glass-panel rounded-3xl p-5 border border-white/5 hover:border-neon-green/20 hover:shadow-[0_0_20px_rgba(57,255,20,0.04)] transition-all duration-300">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 pb-3 border-b border-white/5">
                          <h4 className="font-extrabold text-sm text-neon-green group-hover:text-neon-blue transition-colors">
                            {week.focus}
                          </h4>
                          <span className="text-[10px] text-gray-500 font-bold tracking-wider uppercase">
                            Freq: {week.exerciseFrequency}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Left Column: Milestone */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-500 uppercase">Weekly Milestone</p>
                            <p className="text-xs text-gray-200 leading-relaxed font-semibold">{week.milestone}</p>
                          </div>

                          {/* Right Column: Targets */}
                          <div className="flex gap-6 items-center">
                            <div>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Calorie Goal</p>
                              <p className="text-sm font-extrabold text-white mt-0.5">{week.dailyCalorieTarget} <span className="text-[10px] text-gray-400 font-normal">kcal/day</span></p>
                            </div>
                            <div className="border-l border-white/5 pl-6">
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Protein Goal</p>
                              <p className="text-sm font-extrabold text-neon-blue mt-0.5">{week.dailyProteinTarget}g <span className="text-[10px] text-gray-400 font-normal">/day</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
