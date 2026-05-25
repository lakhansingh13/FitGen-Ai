'use client';

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
  HelpCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
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
      const res = await fetch('/api/progress');
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
      const workoutRes = await fetch('/api/workout/generate', { method: 'GET' }).catch(() => null);
      // Wait, let's fetch from separate user endpoint if needed.
      // But we can check if a plan already exists by GET.
      // If we haven't defined a GET handler in /api/workout/generate, let's build it or just fetch custom workout plan details.
      // Let's implement GET in /api/workout/generate as well or load it directly. We'll handle it below.
      const planRes = await fetch('/api/progress'); // We can check if plan is loaded. Let's make a GET call to /api/workout/generate.
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
      const res = await fetch('/api/progress', {
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
      const res = await fetch('/api/workout/generate', { method: 'POST' });
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
    const fetchWorkoutPlan = async () => {
      try {
        const res = await fetch('/api/workout/generate'); // Let's check. Wait! We can retrieve from a dedicated GET, let's define it later or check if we can fetch it now.
        // Let's implement GET in app/api/workout/generate/route.ts to return the existing plan.
        const response = await fetch('/api/workout/plan'); // we will create a path /api/workout/plan or handle it in app/api/workout/generate
      } catch (e) {}
    };
    
    // Instead, let's query DB for user's workout. We can write a quick endpoint or fetch it.
    // For simplicity, we can fetch from a generic endpoint, or GET /api/workout/generate.
    const loadPlan = async () => {
      try {
        const res = await fetch('/api/workout/generate'); // Let's support GET in workout/generate route.
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
        <div className="flex-1 flex items-center justify-center text-neon-green">
          <Activity className="w-10 h-10 animate-spin" />
          <span className="ml-3 font-bold">Loading FitGen Dashboard...</span>
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

  return (
    <div className="flex bg-[#030408] min-h-screen text-gray-100 font-sans">
      <Sidebar />

      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-10 z-10 relative">
        {/* Glow Blurs */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-neon-green/3 rounded-full blur-[100px] pointer-events-none" />

        {/* Dashboard Header */}
        <header className="mb-8 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-wide">Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Welcome back, {user?.name} 👋 Ready to crush your goals?</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-green" />
              <span className="text-xs font-bold text-gray-300">Level {user?.levelNumber}</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
              <span className="text-xs font-bold text-neon-green">{user?.goal.replace('_', ' ').toUpperCase()}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid Row 1: Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calorie Card */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Calories Goal</p>
                <h3 className="text-2xl font-extrabold text-white mt-2">
                  {progress?.caloriesBurnedHistory?.reduce((sum, item) => sum + item.calories, 0) || 0}
                  <span className="text-xs text-gray-500 font-medium ml-1">kcal burned</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <Flame className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs text-gray-400 border-t border-white/5 pt-3 mt-4">
              Total active calories logged.
            </div>
          </div>

          {/* Streak Card */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workout Streak</p>
                <h3 className="text-2xl font-extrabold text-neon-green mt-2">
                  {user?.streak} <span className="text-xs text-gray-400 font-medium">Days</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-neon-green/10 border border-neon-green/20 text-neon-green">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs text-gray-400 border-t border-white/5 pt-3 mt-4">
              Log daily sessions to build multipliers!
            </div>
          </div>

          {/* Water Intake Card */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Water Intake</p>
                <h3 className="text-2xl font-extrabold text-white mt-2">
                  {waterCount} <span className="text-xs text-gray-400 font-medium">/ 8 glasses</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Droplet className="w-5 h-5" />
              </div>
            </div>
            <button
              onClick={handleLogWater}
              className="mt-4 w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Log 1 Glass (250ml)
            </button>
          </div>

          {/* BMI Card */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">BMI Index</p>
                <h3 className="text-2xl font-extrabold text-white mt-2">
                  {bmi} <span className={`text-xs font-bold ${bmiColor} ml-1`}>{bmiCategory}</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-xs text-gray-400 border-t border-white/5 pt-3 mt-4">
              Height: {user?.height}cm | Weight: {user?.weight}kg
            </div>
          </div>
        </section>

        {/* Dashboard Grid Row 2: Charts and Workouts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Chart */}
          <div className="glass-panel rounded-2xl p-5 lg:col-span-2 min-h-[300px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-extrabold text-base text-white">Progress Overview</h3>
              <span className="text-xs font-bold text-neon-green px-2 py-1 rounded bg-neon-green/10">Active Calories (kcal)</span>
            </div>
            <div className="flex-1 w-full min-h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#39ff14" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d141e',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="calories" stroke="#39ff14" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Workout */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-base text-white">Today's Workout</h3>
                <span className="text-xs text-gray-500 font-semibold">{todayName}</span>
              </div>

              {!workout ? (
                <div className="text-center py-6 flex flex-col items-center gap-3">
                  <p className="text-sm text-gray-400">No workout plan found. Let's customize one!</p>
                  <button
                    onClick={handleGenerateWorkout}
                    disabled={generatingWorkout}
                    className="px-5 py-2.5 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white text-xs transition-colors cursor-pointer"
                  >
                    {generatingWorkout ? 'Creating Plan...' : 'Generate AI Workout'}
                  </button>
                </div>
              ) : !todayWorkout || todayWorkout.exercises.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-10 h-10 text-neon-green mx-auto mb-3 stroke-[1.5]" />
                  <p className="text-sm font-bold text-white">Active Recovery Day</p>
                  <p className="text-xs text-gray-400 mt-1">Focus on foam rolling, light walks, or flexibility.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-neon-green/5 border border-neon-green/15 flex items-center justify-between mb-4">
                    <span className="text-xs text-gray-400 font-bold">Target Focus</span>
                    <span className="text-xs text-neon-green font-bold uppercase">{todayWorkout.focus}</span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {todayWorkout.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-white/2 border border-white/3">
                        <span className="text-xs text-gray-200 font-medium truncate max-w-[120px]">{ex.name}</span>
                        <span className="text-xs text-gray-400">{ex.sets}x{ex.reps} ({ex.restTime})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => router.push('/trainer')}
              className="mt-6 w-full py-3 bg-neon-green text-black font-extrabold hover:bg-white rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_20px_rgba(57,255,20,0.25)]"
            >
              <Compass className="w-4 h-4" />
              Launch Posture Camera Trainer
            </button>
          </div>
        </section>

        {/* Dashboard Grid Row 3: Tips & Activities */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tip of the Day */}
          <div className="glass-panel rounded-2xl p-5 flex items-center gap-4 bg-gradient-to-r from-neon-green/5 to-transparent border-neon-green/10">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center text-neon-green shrink-0">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-neon-green uppercase tracking-wider">AI Tip of the Day</h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{tipOfTheDay}</p>
            </div>
          </div>

          {/* Recent Activity Logs */}
          <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
            <h3 className="font-extrabold text-sm text-white mb-4">Webcam Sessions Logs</h3>
            {recentActivities.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No camera workouts completed yet. Try Squats or Pushups in the AI Trainer!</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((session, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/3 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center text-neon-blue text-xs font-bold capitalize">
                        {session.exerciseType[0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white capitalize">{session.exerciseType} Session</p>
                        <p className="text-[10px] text-gray-400">{new Date(session.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-neon-green">{session.repCount} Reps</p>
                      <p className="text-[10px] text-gray-400">{session.caloriesBurned} kcal | {session.duration}s</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <ChatBot />
    </div>
  );
}
