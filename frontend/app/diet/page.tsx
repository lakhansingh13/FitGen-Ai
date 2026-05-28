'use client';
import { apiFetch } from '@/lib/api';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import HeartbeatLoader from '@/components/HeartbeatLoader';
import SkeletonLoader from '@/components/SkeletonLoader';
import { Apple, RefreshCw, CheckCircle2, Droplet, Coffee, Utensils, Sun, Moon } from 'lucide-react';

interface DietPlanData {
  targetCalories: number;
  meals: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
  waterTarget: number;
}

export default function DietPlanner() {
  const router = useRouter();
  const [plan, setPlan] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchPlan = async () => {
    try {
      const res = await apiFetch('/api/diet/generate');
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
    fetchPlan();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setMessage('');
    try {
      const res = await apiFetch('/api/diet/generate', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        setMessage('Your high-protein daily diet has been customized by FitGen AI!');
      } else {
        throw new Error('Failed to generate diet');
      }
    } catch (err) {
      console.error(err);
      setMessage('Error building diet plan. Please check configurations.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto pl-14 pr-6 py-8 md:px-10 z-10 relative">
        {/* Glow Blur */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-blue/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">Diet Planner</h1>
            <p className="text-sm text-gray-400 mt-1">Review your customized macros and healthy Indian recipe recommendations.</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-colors cursor-pointer text-sm shadow-[0_0_15px_rgba(57,255,20,0.15)] disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating Diet...' : 'Regenerate with Gemini'}
          </button>
        </header>

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {message}
          </div>
        )}

        {loading ? (
          <div className="w-full py-10">
            <SkeletonLoader type="card" count={3} />
          </div>
        ) : generating ? (
          <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-white/5 min-h-[400px]">
            <HeartbeatLoader text="Calculating Nutrients & Crafting Diet Splits..." />
          </div>
        ) : !plan || !plan.meals ? (
          <div className="glass-panel rounded-3xl p-10 text-center max-w-xl mx-auto border border-white/5 bg-white/2 mt-10">
            <Apple className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-extrabold text-xl text-white">No active diet plan found</h3>
            <p className="text-sm text-gray-400 mt-2 mb-6">
              Establish a baseline daily meal routine matching your goal and BMI specs by calling the Gemini generative model.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-all duration-300"
            >
              {generating ? 'Compiling diet sheets...' : 'Generate AI Diet Plan'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Meal detail cards */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Breakfast */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-white/2 to-transparent">
                  <div className="flex items-center gap-3 mb-4 text-orange-400">
                    <Coffee className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Breakfast</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{plan.meals.breakfast}</p>
                </div>

                {/* Lunch */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-white/2 to-transparent">
                  <div className="flex items-center gap-3 mb-4 text-neon-green">
                    <Utensils className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Lunch</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{plan.meals.lunch}</p>
                </div>

                {/* Snacks */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-white/2 to-transparent">
                  <div className="flex items-center gap-3 mb-4 text-yellow-400">
                    <Sun className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Snacks</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{plan.meals.snacks}</p>
                </div>

                {/* Dinner */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 bg-gradient-to-br from-white/2 to-transparent">
                  <div className="flex items-center gap-3 mb-4 text-neon-blue">
                    <Moon className="w-5 h-5" />
                    <h4 className="font-bold text-sm text-white uppercase tracking-wider">Dinner</h4>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{plan.meals.dinner}</p>
                </div>
              </div>
            </div>

            {/* Quick stats panel */}
            <div className="space-y-6">
              {/* Daily Target */}
              <div className="glass-panel rounded-2xl p-6 border border-neon-green/20 bg-neon-green/3 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-neon-green/5 rounded-full blur-xl" />
                <h4 className="text-xs font-bold text-neon-green uppercase tracking-wider">Daily Target Calories</h4>
                <p className="text-4xl font-extrabold text-white mt-3">
                  {plan.targetCalories} <span className="text-sm text-gray-400 font-medium">kcal</span>
                </p>
                <div className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                  Calculated based on your physical metrics to secure your goals.
                </div>
              </div>

              {/* Water Target */}
              <div className="glass-panel rounded-2xl p-6 border border-blue-500/20 bg-blue-500/3 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-xl" />
                <div className="flex items-center gap-1.5 text-blue-400">
                  <Droplet className="w-4.5 h-4.5" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Water Recommendation</h4>
                </div>
                <p className="text-4xl font-extrabold text-white mt-3">
                  {plan.waterTarget} <span className="text-sm text-gray-400 font-medium">glasses</span>
                </p>
                <div className="text-[10px] text-gray-500 mt-4 leading-relaxed">
                  Drink approximately {plan.waterTarget * 250 / 1000} liters of water across the day to maintain cellular energy levels.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatBot />
    </div>
  );
}
