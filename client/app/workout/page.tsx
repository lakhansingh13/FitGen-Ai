'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import { Activity, Dumbbell, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restTime: string;
}

interface DaySchedule {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface WorkoutPlanData {
  weeklySchedule: DaySchedule[];
}

export default function WorkoutPlanner() {
  const router = useRouter();
  const [plan, setPlan] = useState<WorkoutPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPlan = async () => {
    try {
      const res = await fetch('/api/workout/generate');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setPlan(data.plan);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Add a simple GET path compatibility or load on mount
    fetchPlan();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await fetch('/api/workout/generate', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setMessage('New workout routine customized by FitGen AI!');
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error building workout plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 z-10 relative">
        {/* Glow Blur */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-green/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">Workout Planner</h1>
            <p className="text-sm text-gray-400 mt-1">Review your weekly customized target routines or rebuild them using AI.</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-colors cursor-pointer text-sm shadow-[0_0_15px_rgba(57,255,20,0.15)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating Workout...' : 'Regenerate with Gemini'}
          </button>
        </header>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[300px] text-neon-green">
            <Activity className="w-10 h-10 animate-spin" />
            <span className="ml-3 font-bold">Scanning database schedules...</span>
          </div>
        ) : !plan || !plan.weeklySchedule || plan.weeklySchedule.length === 0 ? (
          <div className="glass-panel rounded-3xl p-10 text-center max-w-xl mx-auto border border-white/5 bg-white/2 mt-10">
            <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-extrabold text-xl text-white">No active workout routine found</h3>
            <p className="text-sm text-gray-400 mt-2 mb-6">
              Establish a baseline routine matching your BMI and goals by requesting a prompt compile from Google Gemini models.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-all duration-300"
            >
              {generating ? 'Compiling routines...' : 'Generate AI Workout Plan'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plan.weeklySchedule.map((dayPlan, i) => {
              const isRestDay = !dayPlan.exercises || dayPlan.exercises.length === 0;
              return (
                <div
                  key={i}
                  className={`glass-panel rounded-3xl p-6 border transition-all duration-300 ${
                    isRestDay
                      ? 'border-white/5 opacity-55'
                      : 'border-neon-green/10 hover:border-neon-green/25 hover:shadow-[0_0_20px_rgba(57,255,20,0.02)]'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-lg text-white">{dayPlan.day}</h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                        isRestDay ? 'bg-white/5 text-gray-400' : 'bg-neon-green/10 text-neon-green'
                      }`}
                    >
                      {isRestDay ? 'Recovery' : 'Active'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white/3 border border-white/5 mb-4 text-center">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Workout Focus</p>
                    <p className="text-xs font-bold text-gray-200 mt-1 truncate">{dayPlan.focus}</p>
                  </div>

                  {isRestDay ? (
                    <div className="text-center py-8 text-gray-500 text-xs leading-relaxed">
                      Squeeze your glutes, take recovery fluids, and perform dynamic hamstring stretches.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {dayPlan.exercises.map((ex, j) => (
                        <div
                          key={j}
                          className="flex flex-col gap-1 p-2.5 rounded-xl bg-white/2 border border-white/3 text-xs"
                        >
                          <div className="font-extrabold text-gray-200">{ex.name}</div>
                          <div className="flex justify-between text-gray-400 text-[10px] mt-1 font-medium">
                            <span>Sets: {ex.sets} | Reps: {ex.reps}</span>
                            <span>Rest: {ex.restTime}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
