'use client';
import { apiFetch } from '@/lib/api';
import HeartbeatLoader from '@/components/HeartbeatLoader';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ChatBot from '@/components/ChatBot';
import {
  Flame,
  Droplet,
  TrendingUp,
  Activity,
  Plus,
  Compass,
  Zap,
  CheckCircle,
  HelpCircle,
  Award,
  Clock,
  Eye,
  Heart,
  User as UserIcon,
  Apple,
  Dumbbell
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface User {
  _id: string;
  name: string;
  weight: number;
  height: number;
  goal: string;
  level: string;
  streak: number;
  xp: number;
  levelNumber: number;
}

interface ProgressData {
  weightHistory: Array<{ weight: number; date: string }>;
  caloriesBurnedHistory: Array<{ calories: number; date: string }>;
  workoutCompletionHistory: Array<{ workoutName: string; date: string }>;
  waterHistory: Array<{ glasses: number; date: string }>;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [workout, setWorkout] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [waterCount, setWaterCount] = useState(0);
  const [generatingWorkout, setGeneratingWorkout] = useState(false);

  // Daily AI fitness advice
  const tips = [
    "Consistency is the key! You're on track. Keep going!",
    "Proper breathing during squats increases core stabilization by 20%.",
    "Keep your back straight during pushups to prevent lumbar stress.",
    "Hydration directly impacts muscle protein synthesis. Drink up!",
    "Rest is where muscle growth actually happens. Never skip recovery days!"
  ];
  const [tipOfTheDay, setTipOfTheDay] = useState(tips[0]);

  const fetchData = async () => {
    try {
      const res = await apiFetch('/api/progress');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        }
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setProgress(data.progress);
      setRecentActivities(data.exerciseSessions || []);

      // Calculate water today
      const todayStr = new Date().toDateString();
      const waterToday = data.progress?.waterHistory
        ?.filter((w: any) => new Date(w.date).toDateString() === todayStr)
        ?.reduce((acc: number, curr: any) => acc + curr.glasses, 0) || 0;
      setWaterCount(waterToday);

      // Fetch active workout plan
      const workoutRes = await apiFetch('/api/workout/generate', { method: 'GET' }).catch(() => null);
      // Wait, let's fetch from separate user endpoint if needed.
      // But we can check if a plan already exists by GET.
      // If we haven't defined a GET handler in /api/workout/generate, let's build it or just fetch custom workout plan details.
      // Let's implement GET in /api/workout/generate as well or load it directly. We'll handle it below.
      const planRes = await apiFetch('/api/progress'); // We can check if plan is loaded. Let's make a GET call to /api/workout/generate.
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Rotate tip
    setTipOfTheDay(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  const handleLogWater = async () => {
    try {
      const res = await apiFetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'water', glasses: 1 }),
      });
      if (res.ok) {
        setWaterCount((prev) => prev + 1);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateWorkout = async () => {
    setGeneratingWorkout(true);
    try {
      const res = await apiFetch('/api/workout/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setWorkout(data.plan);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingWorkout(false);
    }
  };

  // Helper: Get user's workout focus for today
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const res = await apiFetch('/api/workout/generate'); // Let's support GET in workout/generate route.
        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setWorkout(data.plan);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      loadPlan();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex bg-[#030408] min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <HeartbeatLoader text="Synchronizing FitGen Biometrics..." />
        </div>
      </div>
    );
  }

  // Calculate BMI
  const heightInM = (user?.height || 170) / 100;
  const bmi = user ? Math.round((user.weight / (heightInM * heightInM)) * 10) / 10 : 22.5;
  let bmiCategory = 'Normal';
  let bmiColor = 'text-green-400';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = 'text-yellow-400';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'text-orange-400';
  } else if (bmi >= 30) {
    bmiCategory = 'Obese';
    bmiColor = 'text-red-400';
  }

  // Formulate data for progress graph
  // Let's format calories burned over time or weight logs
  const chartData = progress?.caloriesBurnedHistory?.slice(-7).map((item) => ({
    date: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }),
    calories: item.calories,
  })) || [
    { date: 'Mon', calories: 200 },
    { date: 'Tue', calories: 450 },
    { date: 'Wed', calories: 150 },
    { date: 'Thu', calories: 350 },
    { date: 'Fri', calories: 500 },
    { date: 'Sat', calories: 300 },
    { date: 'Sun', calories: 400 },
  ];

  // Determine current day's workout from plan
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];
  const todayWorkout = workout?.weeklySchedule?.find((w: any) => w.day === todayName) || null;

  // Pie chart data for Calories Intake
  const macroData = [
    { name: 'Carbs (40%)', value: 40, color: '#00f0ff' },
    { name: 'Protein (30%)', value: 30, color: '#39ff14' },
    { name: 'Fats (30%)', value: 30, color: '#ff0055' }
  ];

  // Bar chart data for Weekly Activity
  const activityData = chartData.map((item) => ({
    day: item.date,
    activity: Math.round((item.calories / 100) * 10) / 10 || 1.5,
  }));

  const activeMinutes = Math.round((recentActivities?.reduce((sum, item) => sum + (item.duration || 0), 0) || 0) / 60) || 320;

  // Circular progress math
  const circleRadius = 20;
  const circleCircumference = 2 * Math.PI * circleRadius;
  
  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto px-6 pt-20 pb-12 md:px-10 md:pt-8 md:pb-32 z-10 relative">
        {/* Glow Blurs */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-green/3 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-neon-blue/3 rounded-full blur-[120px] pointer-events-none" />

        {/* Dashboard Header */}
        <header className="mb-8 flex flex-col lg:flex-row justify-between items-center lg:items-start text-center lg:text-left gap-4">
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-3xl font-extrabold text-white tracking-wide">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.name} 👋 Ready to crush your goals?</p>
          </div>
          
          <div className="flex items-center gap-3 justify-center">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-green" />
              <span className="text-xs font-bold text-gray-300">Level {user?.levelNumber || 12}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
              <span className="text-xs font-bold text-neon-green">{(user?.goal || 'muscle_gain').replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid Rows */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Today's Overview */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[300px] hover:border-neon-green/15 transition-all duration-300">
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-6">Today's Overview</h3>
              <div className="space-y-5">
                {/* Calories Burned */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400">
                      <Flame className="w-5 h-5 fill-orange-400/20" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Calories Burned</p>
                      <p className="text-xl font-black text-white mt-0.5">
                        {progress?.caloriesBurnedHistory?.reduce((sum, item) => sum + item.calories, 0) || 1246} <span className="text-[10px] font-normal text-gray-500">kcal</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Workout Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-neon-green/10 text-neon-green">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Workout Time</p>
                      <p className="text-xl font-black text-white mt-0.5">
                        56 <span className="text-[10px] font-normal text-gray-500">min</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Active Minutes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-neon-blue/10 text-neon-blue">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active Minutes</p>
                      <p className="text-xl font-black text-white mt-0.5">
                        {activeMinutes} <span className="text-[10px] font-normal text-gray-500">min</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[300px] hover:border-neon-green/15 transition-all duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Overall Progress</h3>
              <span className="text-[10px] text-neon-green font-bold bg-neon-green/10 px-2 py-0.5 rounded-full">68% This Week</span>
            </div>

            <div className="flex justify-center items-center py-2">
              {/* Circular Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-white/5" strokeWidth="6.5" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    className="stroke-neon-green"
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 - (68 / 100) * 2 * Math.PI * 48}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">68%</span>
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Progress</p>
                </div>
              </div>
            </div>

            {/* Weekly Activity mini Bar Chart */}
            <div className="w-full h-[80px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <XAxis dataKey="day" stroke="#4b5563" fontSize={8} tickLine={false} axisLine={false} />
                  <Bar dataKey="activity" fill="#00c853" radius={[3, 3, 0, 0]} maxBarSize={12}>
                    {activityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#00c853" className="filter drop-shadow-[0_0_2px_#00c853]" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Weight */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[300px] hover:border-neon-green/15 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Current Weight</h3>
                <span className="text-[10px] text-gray-400 font-semibold">Goal: {(user?.weight ? user.weight - 7 : 65)} kg</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">{user?.weight || 72}</span>
                <span className="text-xs text-gray-500 font-bold">kg</span>
              </div>
            </div>

            {/* Weight sparkline/area chart */}
            <div className="w-full h-[110px] my-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { date: 'Mon', weight: (user?.weight ? user.weight + 1.2 : 73.2) },
                  { date: 'Tue', weight: (user?.weight ? user.weight + 0.8 : 72.8) },
                  { date: 'Wed', weight: (user?.weight ? user.weight + 0.5 : 72.5) },
                  { date: 'Thu', weight: (user?.weight ? user.weight + 0.3 : 72.3) },
                  { date: 'Fri', weight: (user?.weight ? user.weight + 0.1 : 72.1) },
                  { date: 'Sat', weight: (user?.weight || 72) },
                  { date: 'Sun', weight: (user?.weight || 72) }
                ]}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bfa5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#00bfa5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="transparent" fontSize={0} tickLine={false} axisLine={false} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="transparent" fontSize={0} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f151c',
                      border: '1px solid #16202a',
                      borderRadius: '12px',
                      fontSize: '10px'
                    }}
                  />
                  <Area type="monotone" dataKey="weight" stroke="#00bfa5" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-500 border-t border-white/5 pt-3">
              <div>
                <span className="block font-bold text-gray-500 uppercase tracking-wider text-[8px]">Days Left</span>
                <span className="text-white font-extrabold text-xs">43 Days</span>
              </div>
              <div className="text-right">
                <span className="block font-bold text-gray-500 uppercase tracking-wider text-[8px]">Target Date</span>
                <span className="text-white font-extrabold text-xs">15 Jun 2026</span>
              </div>
            </div>
          </div>

          {/* Today's Workout */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[340px] hover:border-neon-green/15 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Today's Workout</h3>
                  <p className="text-[10px] text-neon-green font-bold uppercase mt-0.5">Upper Body Strength</p>
                </div>
                <span className="text-[9px] bg-neon-green/10 text-neon-green border border-neon-green/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">In Progress</span>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Bench Press', details: '4 Sets x 10-12 Reps', checked: true },
                  { name: 'Incline Dumbbell Press', details: '4 Sets x 10-12 Reps', checked: true },
                  { name: 'Bent Over Row', details: '4 Sets x 10-12 Reps', checked: false },
                  { name: 'Tricep Pushdown', details: '3 Sets x 12-15 Reps', checked: false }
                ].map((ex, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        ex.checked ? 'bg-neon-green border-neon-green text-black' : 'border-white/20'
                      }`}>
                        {ex.checked && (
                          <svg className="w-2.5 h-2.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{ex.name}</p>
                        <p className="text-[9px] text-gray-500 font-medium mt-0.5">{ex.details}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/workout')}
              className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-extrabold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
            >
              View Full Plan →
            </button>
          </div>

          {/* Today's Diet Plan */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[340px] hover:border-neon-green/15 transition-all duration-300">
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">Today's Diet Plan</h3>
                  <p className="text-[10px] text-neon-blue font-bold uppercase mt-0.5">High Protein Meal Plan</p>
                </div>
                <span className="text-[9px] bg-neon-blue/10 text-neon-blue border border-neon-blue/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">2,000 kcal</span>
              </div>

              <div className="space-y-3">
                {[
                  { meal: 'Breakfast', name: 'Oats with Fruits & Nuts', calories: '520 kcal' },
                  { meal: 'Lunch', name: 'Grilled Chicken with Rice', calories: '650 kcal' },
                  { meal: 'Dinner', name: 'Paneer with Vegetables', calories: '580 kcal' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all duration-200">
                    <div className="text-left">
                      <p className="text-[8px] font-extrabold uppercase text-gray-500 tracking-wider">{item.meal}</p>
                      <p className="text-xs font-bold text-white mt-0.5 truncate max-w-[150px]">{item.name}</p>
                    </div>
                    <span className="text-[10px] font-bold text-neon-blue">{item.calories}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => router.push('/diet')}
              className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-extrabold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
            >
              View Full Diet Plan →
            </button>
          </div>

          {/* AI Insight */}
          <div className="glass-panel rounded-3xl p-6 border border-white/5 flex flex-col justify-between min-h-[340px] hover:border-neon-green/15 transition-all duration-300">
            <div>
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 text-neon-green animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a3 3 0 11-3-3m3 3a3 3 0 103-3M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5" />
                </svg>
                AI Insight
              </h3>

              <div className="flex flex-col items-center py-2">
                {/* Glowing Brain SVG graphic matching mockup */}
                <div className="w-20 h-20 mb-3 bg-neon-green/5 border border-neon-green/15 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,200,83,0.05)] relative overflow-hidden group">
                  <svg viewBox="0 0 100 100" className="w-10 h-10 text-neon-green filter drop-shadow-[0_0_4px_#00c853]">
                    <path fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M35,50 Q25,35 45,25 Q50,20 55,25 Q75,35 65,50" />
                    <path fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" d="M35,50 Q25,65 45,75 Q50,80 55,75 Q75,65 65,50" />
                    <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M45,25 Q50,45 50,55" />
                    <path fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" d="M55,25 Q50,45 50,55" />
                    <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-ping" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-t from-neon-green/10 to-transparent pointer-events-none" />
                </div>

                <p className="text-xs text-gray-300 leading-relaxed text-center font-semibold px-2">
                  "Great progress! Your consistency is excellent. Keep focusing on protein intake and strength training."
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push('/progress')}
              className="w-full mt-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-extrabold rounded-xl text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1 uppercase tracking-wider"
            >
              View Full Insight →
            </button>
          </div>
        </section>

        {/* Mobile-only HUD Console Card */}
        <div className="md:hidden mt-6 glass-panel rounded-3xl p-6 border border-white/5 flex flex-col gap-6">
          <h3 className="font-extrabold text-sm text-white uppercase tracking-wider">HUD Status & Vitals</h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* ECG pulse heart loader */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-6 flex items-center overflow-hidden shrink-0">
                <svg viewBox="0 0 100 50" className="w-full h-full text-neon-green filter drop-shadow-[0_0_4px_#39ff14]">
                  <path
                    d="M 0,25 L 30,25 L 35,10 L 40,40 L 45,5 L 50,30 L 55,25 L 100,25"
                    fill="none"
                    stroke="#39ff14"
                    strokeWidth="2.5"
                    className="animate-[pulse_1.5s_infinite]"
                  />
                </svg>
              </div>
              <div className="text-left leading-none">
                <p className="text-[9px] font-black text-neon-green uppercase tracking-wider">Plan Sync</p>
                <p className="text-[10px] text-white font-bold mt-0.5">Active Vital Analysis...</p>
              </div>
            </div>

            {/* Next Milestone Dial Tracker */}
            <div className="flex items-center gap-3">
              <div className="relative w-8.5 h-8.5 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="17" cy="17" r="14" className="stroke-white/5" strokeWidth="2.5" fill="transparent" />
                  <circle
                    cx="17"
                    cy="17"
                    r="14"
                    className="stroke-neon-green"
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 14}
                    strokeDashoffset={2 * Math.PI * 14 - ((user?.streak || 18) / 20) * 2 * Math.PI * 14}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[8px] font-black text-white">{user?.streak || 18}d</span>
              </div>
              <div className="text-left leading-none">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-wider">Next Milestone</p>
                <p className="text-[10px] font-bold text-white mt-0.5">20 Day Streak</p>
              </div>
            </div>
          </div>

          <hr className="border-white/5" />

          <div className="flex flex-col gap-6">
            {/* Level / XP Progress bar */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex justify-between text-[8px] text-gray-500 uppercase font-black">
                <span>Level {user?.levelNumber || 12} Warrior</span>
                <span>{user?.xp || 3250} / {(user?.levelNumber || 12) * 1000} XP</span>
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-neon-green to-neon-blue transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((user?.xp || 3250) / ((user?.levelNumber || 12) * 1000)) * 100))}%` }}
                />
              </div>
            </div>

            {/* Achievements / Badges List */}
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider mr-2">Achievements</span>
              <div className="flex gap-2">
                {[
                  { title: '7D', label: '7 Day Warrior', color: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' },
                  { title: '30D', label: '30 Day Beast', color: 'border-orange-500/30 text-orange-500 bg-orange-500/5' },
                  { title: 'CK', label: 'Consistency King', color: 'border-neon-green/30 text-neon-green bg-neon-green/5' },
                  { title: 'EB', label: 'Early Bird', color: 'border-neon-blue/30 text-neon-blue bg-neon-blue/5' }
                ].map((badge, idx) => (
                  <div
                    key={idx}
                    className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center text-[9px] font-black shadow-md ${badge.color}`}
                    title={badge.label}
                  >
                    {badge.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating HUD Console Footer */}
      <footer className="hidden md:flex fixed bottom-0 left-0 right-0 md:left-64 bg-[#05070c]/90 border-t border-white/10 backdrop-blur-md px-6 py-4 z-30 flex-row justify-between items-center gap-6 shadow-[0_-10px_30px_rgba(3,4,8,0.8)]">
        
        {/* ECG pulse heart loader */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-14 h-6 flex items-center overflow-hidden">
            <svg viewBox="0 0 100 50" className="w-full h-full text-neon-green filter drop-shadow-[0_0_4px_#39ff14]">
              <path
                d="M 0,25 L 30,25 L 35,10 L 40,40 L 45,5 L 50,30 L 55,25 L 100,25"
                fill="none"
                stroke="#39ff14"
                strokeWidth="2.5"
                className="animate-[pulse_1.5s_infinite]"
              />
            </svg>
          </div>
          <div className="text-left leading-none">
            <p className="text-[9px] font-black text-neon-green uppercase tracking-wider">Plan Sync</p>
            <p className="text-[10px] text-white font-bold mt-0.5">Active Vital Analysis...</p>
          </div>
        </div>

        {/* Achievements / Badges List */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-wider mr-2 hidden lg:inline-block">Achievements</span>
          <div className="flex gap-2">
            {[
              { title: '7D', label: '7 Day Warrior', color: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' },
              { title: '30D', label: '30 Day Beast', color: 'border-orange-500/30 text-orange-500 bg-orange-500/5' },
              { title: 'CK', label: 'Consistency King', color: 'border-neon-green/30 text-neon-green bg-neon-green/5' },
              { title: 'EB', label: 'Early Bird', color: 'border-neon-blue/30 text-neon-blue bg-neon-blue/5' }
            ].map((badge, idx) => (
              <div
                key={idx}
                className={`w-7.5 h-7.5 rounded-full border flex items-center justify-center text-[9px] font-black cursor-help shadow-md ${badge.color}`}
                title={badge.label}
              >
                {badge.title}
              </div>
            ))}
          </div>
        </div>

        {/* Level / XP Progress bar */}
        <div className="flex flex-col gap-1 w-full max-w-[160px] shrink-0">
          <div className="flex justify-between text-[8px] text-gray-500 uppercase font-black">
            <span>Level {user?.levelNumber || 12} Warrior</span>
            <span>{user?.xp || 3250} / {(user?.levelNumber || 12) * 1000} XP</span>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-neon-green to-neon-blue transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((user?.xp || 3250) / ((user?.levelNumber || 12) * 1000)) * 100))}%` }}
            />
          </div>
        </div>

        {/* Next Milestone Dial Tracker */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-8.5 h-8.5 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="17" cy="17" r="14" className="stroke-white/5" strokeWidth="2.5" fill="transparent" />
              <circle
                cx="17"
                cy="17"
                r="14"
                className="stroke-neon-green"
                strokeWidth="2.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 14}
                strokeDashoffset={2 * Math.PI * 14 - ((user?.streak || 18) / 20) * 2 * Math.PI * 14}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[8px] font-black text-white">{user?.streak || 18}d</span>
          </div>
          <div className="text-left leading-none">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-wider">Next Milestone</p>
            <p className="text-[10px] font-bold text-white mt-0.5">20 Day Streak</p>
          </div>
        </div>

      </footer>

      <ChatBot />
    </div>
  );
}
