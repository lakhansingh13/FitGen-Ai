'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  Flame,
  Camera,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Award,
  Apple,
  Shield
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await apiFetch('/api/auth/me');
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const stats = [
    { value: '50K+', label: 'Active Users', icon: TrendingUp },
    { value: '120+', label: 'Workouts', icon: Flame },
    { value: '98%', label: 'Satisfaction', icon: Zap },
    { value: '24/7', label: 'AI Support', icon: MessageSquare },
  ];

  const features = [
    {
      title: 'Pose Detection Camera',
      desc: 'Connect your webcam for real-time rep counting and squat/pushup posture correction feedbacks.',
      icon: Camera,
      color: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30'
    },
    {
      title: 'AI Workout Planner',
      desc: 'Instantly generate detailed multi-day schedules tailored specifically to your bodyweight, heights, and target goals.',
      icon: Flame,
      color: 'from-orange-500/20 to-red-500/20',
      border: 'border-orange-500/30'
    },
    {
      title: 'AI Diet Planner',
      desc: 'Receive customized breakfast, lunch, dinner, snacks, and water recommendations matching your calorie caps.',
      icon: Apple,
      color: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30'
    },
    {
      title: 'Gamified Milestones',
      desc: 'Earn XP points, log active water intakes, maintain workout streaks, and unlock unique accomplishment badges.',
      icon: Award,
      color: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30'
    }
  ];



  const pricing = [
    {
      name: 'Base Tier',
      price: '$0',
      desc: 'Perfect to explore AI assistants and standard logs.',
      features: [
        'AI workout generator (3 plans/mo)',
        'AI diet recommendation (3 plans/mo)',
        'Floating Chatbot support',
        'Basic water & weight logging'
      ],
      cta: 'Start Free Trial',
      popular: false,
      href: '/signup'
    },
    {
      name: 'Premium Pro',
      price: '$19',
      desc: 'Designed for professional gym-goers and athletes.',
      features: [
        'Unlimited AI Workout generation',
        'Unlimited AI Diet plan scaling',
        'Webcam Posture Correction Camera',
        'Real-time Rep counters (Pushup/Squat)',
        'Full Progress charts history',
        'Early badge/milestone levels unlocking'
      ],
      cta: 'Go Premium Pro',
      popular: true,
      href: '/signup'
    }
  ];

  const faqs = [
    {
      q: 'How does the pose detection feature work?',
      a: 'The Pose Detector uses your webcam stream (processed securely) to calculate joint angles at the shoulder, elbow, hip, and knee. It recognizes when you reach correct depth and automatically counts your reps while giving posture corrections.'
    },
    {
      q: 'Is my camera stream saved on your servers?',
      a: 'No! The computer vision processing is done on our fast FastAPI microservice over secure WebSockets. Frames are processed live in-memory and are never stored or saved.'
    },
    {
      q: 'Can I customize Indian food options in the diet planner?',
      a: 'Absolutely! Our Gemini model generates meals customized specifically to Indian tastes (Roti, Dal, Paneer, Chana) alongside vegetarian or non-vegetarian preferences.'
    },
    {
      q: 'How do I level up my profile?',
      a: 'By logging your daily habits! Completing workouts gets you 150 XP, logging water gets you 10 XP, and logging weight gets you 50 XP. Level requirements increase by 1000 XP per level.'
    }
  ];

  return (
    <div className="bg-[#030408] min-h-screen text-gray-100 overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-8 px-6 overflow-hidden">
        {/* Glow meshes */}
        <div className="absolute top-20 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-green/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-blue/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center z-10 w-full">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left gap-5 lg:-translate-y-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green font-bold text-[10px] sm:text-xs uppercase tracking-widest w-fit animate-pulse-green">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Fitness Trainer
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Train Smarter.<br />
              <span className="text-gradient-neon">Transform Faster.</span>
            </h1>

            <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl">
              AI-powered workouts, posture correction, smart nutrition, and real-time transformation tracking.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full justify-center lg:justify-start">
              <Link
                href={isLoggedIn ? "/dashboard" : "/login"}
                className="w-full max-w-xs sm:max-w-none sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-neon-green text-black font-extrabold hover:bg-white transition-all duration-300 shadow-[0_0_25px_rgba(0,200,83,0.25)] hover:shadow-[0_0_35px_rgba(0,200,83,0.45)] hover:scale-103 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                Start Your Transformation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="w-full max-w-xs sm:max-w-none sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold hover:scale-103 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Watch Demo
              </Link>
            </div>

            {/* Horizontal capsule bullets */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-2.5 mt-4 w-full max-w-sm sm:max-w-none">
              {[
                {
                  title: 'AI Coach',
                  detail: '24/7 Support',
                  icon: MessageSquare,
                  highlight: 'text-neon-green border-neon-green/20 bg-neon-green/5 hover:bg-neon-green/10 hover:border-neon-green/40'
                },
                {
                  title: 'Smart Plans',
                  detail: 'Just For You',
                  icon: Sparkles,
                  highlight: 'text-neon-blue border-neon-blue/20 bg-neon-blue/5 hover:bg-neon-blue/10 hover:border-neon-blue/40'
                },
                {
                  title: 'Real-Time Tracking',
                  detail: 'Live Progress',
                  icon: Activity,
                  highlight: 'text-white border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30'
                },
                {
                  title: 'Data Protected',
                  detail: '100% Secure',
                  icon: Shield,
                  highlight: 'text-gray-300 border-white/10 bg-white/[0.03] hover:bg-white/5 hover:border-white/20'
                }
              ].map((bullet, idx) => {
                const BulletIcon = bullet.icon;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-center sm:justify-start gap-1.5 px-3 py-2 sm:px-4 sm:py-2 rounded-full border text-[10px] sm:text-xs font-semibold backdrop-blur-md transition-all duration-300 hover:translate-y-[-1.5px] cursor-default ${bullet.highlight}`}
                  >
                    <BulletIcon className="w-3.5 h-3.5" />
                    <span className="font-extrabold tracking-wide uppercase">{bullet.title}</span>
                    <span className="opacity-75 font-normal ml-0.5">({bullet.detail})</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Hero Standalone Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex relative justify-center items-center w-full h-[350px] lg:h-[800px] overflow-visible -translate-y-4 lg:-translate-y-16"
          >
            {/* Animated Glowing Core behind the girl */}
            <motion.div
              className="absolute w-[400px] h-[400px] bg-neon-green/10 rounded-full blur-[100px] pointer-events-none z-0"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Secondary blue glow */}
            <motion.div
              className="absolute w-[350px] h-[350px] bg-neon-blue/8 rounded-full blur-[120px] pointer-events-none z-0"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Background HUD elements (Z-0, completely behind the girl) */}
            <div className="absolute w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] flex items-center justify-center pointer-events-none z-0 overflow-visible [perspective:1000px]">
              <div
                className="w-full h-full relative flex items-center justify-center"
                style={{ transform: "rotateX(70deg) rotateY(-15deg)", transformStyle: "preserve-3d" }}
              >
                {/* Orbiting Dot 1 Ring (Clockwise) */}
                <motion.div
                  className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-white/10"
                  style={{ transform: "translateZ(35px)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  {/* Orbiting Dot 1 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-neon-green rounded-full shadow-[0_0_12px_#00c853]" />
                </motion.div>

                {/* Orbiting Dot 2 Ring (Counter-Clockwise) */}
                <motion.div
                  className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border border-white/10"
                  style={{ transform: "translateZ(-45px)" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
                >
                  {/* Orbiting Dot 2 */}
                  <div className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 w-2 h-2 bg-neon-blue rounded-full shadow-[0_0_10px_#00bfa5]" />
                </motion.div>

                {/* Concentric Center Ripple */}
                <motion.div
                  className="absolute w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] rounded-full border border-neon-green/20"
                  style={{ transform: "translateZ(10px)" }}
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* 3D Wrapping Rings - BACK HALF (Behind the girl) */}
            <div 
              className="absolute w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] flex items-center justify-center pointer-events-none z-0 overflow-visible [perspective:1000px]"
              style={{ clipPath: "inset(0px 0px 50% 0px)" }}
            >
              <div
                className="w-full h-full relative flex items-center justify-center"
                style={{ transform: "rotateX(70deg) rotateY(-15deg)", transformStyle: "preserve-3d" }}
              >
                {/* Outer Dashed Ring (Clockwise) */}
                <motion.div
                  className="absolute w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full border-2 border-dashed border-neon-green/25"
                  style={{ transform: "translateZ(0px)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Double Ring (Counter-Clockwise) */}
                <motion.div
                  className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-neon-blue/20 border-t-neon-blue/60 border-b-neon-blue/60"
                  style={{ transform: "translateZ(-25px)" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>

            {/* Floating Standalone Girl FitGen image */}
            <motion.img
              src="/images/fit6.png"
              alt="FitGen AI Coach"
              className="relative w-full h-full object-contain z-10 scale-115 lg:scale-[1.65] drop-shadow-[0_0_55px_rgba(0,200,83,0.35)] origin-center"
              animate={{
                y: [0, -18, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* 3D Wrapping Rings - FRONT HALF (In front of the girl) */}
            <div 
              className="absolute w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] flex items-center justify-center pointer-events-none z-20 overflow-visible [perspective:1000px]"
              style={{ clipPath: "inset(50% 0px 0px 0px)" }}
            >
              <div
                className="w-full h-full relative flex items-center justify-center"
                style={{ transform: "rotateX(70deg) rotateY(-15deg)", transformStyle: "preserve-3d" }}
              >
                {/* Outer Dashed Ring (Clockwise) */}
                <motion.div
                  className="absolute w-[380px] h-[380px] sm:w-[480px] sm:h-[480px] rounded-full border-2 border-dashed border-neon-green/25"
                  style={{ transform: "translateZ(0px)" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Double Ring (Counter-Clockwise) */}
                <motion.div
                  className="absolute w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full border border-neon-blue/20 border-t-neon-blue/60 border-b-neon-blue/60"
                  style={{ transform: "translateZ(-25px)" }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sub-hero Capabilities Bar */}
        <div className="mt-12 lg:-mt-36 border-t border-white/5 pt-8 lg:pt-12 z-10 w-full">
          <p className="text-center text-[10px] font-black text-neon-green uppercase tracking-[0.25em] mb-8">
            POWERED BY AI. DRIVEN BY YOU.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-6xl mx-auto px-4">
            {[
              { title: 'AI Workout Plans', desc: 'Custom splits & logs', icon: Flame },
              { title: 'AI Diet Planner', desc: 'Indian meals & macros', icon: Apple },
              { title: 'Posture Correction', desc: 'Real-time joint angles', icon: Camera },
              { title: 'Progress Tracking', desc: 'Before/after photo slider', icon: TrendingUp },
              { title: 'AI Chat Coach', desc: '24/7 fitness advisory', icon: MessageSquare }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-2xl p-4 border border-white/5 hover:border-neon-green/20 transition-all duration-300 flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-neon-green group-hover:bg-neon-green group-hover:text-black transition-colors duration-300 mb-3 shadow-[0_0_10px_rgba(57,255,20,0.05)] group-hover:shadow-[0_0_15px_rgba(57,255,20,0.25)]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">{item.title}</h4>
                  <p className="text-[10px] text-gray-500 mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center flex flex-col gap-4 mb-20">
          <h2 className="text-xs font-bold text-neon-green uppercase tracking-widest">Core Capabilities</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered For Peak Performance</h3>
          <p className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base">
            FitGen AI integrates state-of-the-art computer vision models and large language recommendations to guide every facet of your lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`glass-panel rounded-3xl p-8 border ${feat.border} hover:scale-[1.02] transition-all duration-300 relative group`}
              >
                <div className="flex gap-5 items-start">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-neon-green group-hover:bg-neon-green group-hover:text-black transition-colors duration-300 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xl text-white mb-2">{feat.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>



      {/* Pricing Cards */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center flex flex-col gap-4 mb-20">
          <h2 className="text-xs font-bold text-neon-green uppercase tracking-widest">Pricing Plans</h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Invest In Your Health</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricing.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className={`glass-panel rounded-[30px] p-8 border ${card.popular ? 'border-neon-green/40 shadow-[0_0_30px_rgba(57,255,20,0.05)]' : 'border-white/5'
                } flex flex-col gap-6 relative overflow-hidden`}
            >
              {card.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-neon-green text-black font-extrabold text-[10px] uppercase tracking-wider">
                  Recommended
                </div>
              )}
              <div>
                <h4 className="font-extrabold text-xl text-white">{card.name}</h4>
                <p className="text-gray-500 text-xs mt-1">{card.desc}</p>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">{card.price}</span>
                <span className="text-gray-400 text-sm">/ month</span>
              </div>

              <hr className="border-white/10" />

              <ul className="flex-1 space-y-3.5">
                {card.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-neon-green/10 flex items-center justify-center border border-neon-green/20 shrink-0">
                      <Sparkles className="w-3 h-3 text-neon-green" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={card.href}
                className={`w-full text-center py-3.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${card.popular
                  ? 'bg-neon-green text-black hover:bg-white shadow-[0_0_20px_rgba(57,255,20,0.15)] hover:shadow-[0_0_25px_rgba(57,255,20,0.3)]'
                  : 'bg-white/5 border border-white/10 hover:border-white/30 text-white'
                  }`}
              >
                {card.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-white/5 bg-[#05070c]/50 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center flex flex-col gap-4 mb-16">
            <h2 className="text-xs font-bold text-neon-green uppercase tracking-widest">FAQ</h2>
            <h3 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-white hover:bg-white/2 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${activeFaq === i ? 'rotate-180 text-neon-green' : ''}`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-6 bg-[#030408]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center">
              <Activity className="w-4.5 h-4.5 text-black stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-wider text-white">
              FitGen <span className="text-neon-green">AI</span>
            </span>
          </div>

          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} FitGen AI. All rights reserved. Designed for elite training.
          </p>

          <div className="flex gap-6 text-xs text-gray-400">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
