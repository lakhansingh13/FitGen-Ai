'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Apple
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  const testimonials = [
    {
      name: 'Alex Rivera',
      role: 'Crossfit Enthusiast',
      text: 'The MediaPipe pose tracker corrected my squat depth in the very first session. FitGen AI is a absolute game changer!',
      rating: 5,
    },
    {
      name: 'Karan Sharma',
      role: 'Software Developer',
      text: 'Having a fitness trainer available 24/7 in my chat was exactly what I needed. Custom Indian diets are extremely practical.',
      rating: 5,
    },
    {
      name: 'Sophia Patel',
      role: 'Yoga Practitioner',
      text: 'I love how clean and modern the interface is. Unlocking badges and leveling up keeps me motivated every single morning.',
      rating: 5,
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
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-6 overflow-hidden">
        {/* Glow meshes */}
        <div className="absolute top-20 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-green/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-neon-blue/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10 w-full">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green font-bold text-xs uppercase tracking-widest w-fit animate-pulse-green">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Fitness Trainer
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Your AI Coach.<br />
              <span className="text-gradient-neon">Your Best Shape.</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl leading-relaxed max-w-xl">
              Personalized workouts, smart diet plans, real-time posture feedback, and AI guidance — all in one place. Streamline your routines and elevate your form.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-neon-green text-black font-extrabold hover:bg-white transition-all duration-300 shadow-[0_0_25px_rgba(57,255,20,0.25)] flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 text-base"
              >
                Watch Demo
              </Link>
            </div>

            {/* Trusted Users Row */}
            <div className="flex items-center gap-3 mt-4">
              <div className="flex -space-x-2.5">
                <img className="w-8 h-8 rounded-full border-2 border-[#030408] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="user" />
                <img className="w-8 h-8 rounded-full border-2 border-[#030408] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="user" />
                <img className="w-8 h-8 rounded-full border-2 border-[#030408] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="user" />
                <img className="w-8 h-8 rounded-full border-2 border-[#030408] object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="user" />
              </div>
              <p className="text-xs text-gray-400">
                Trusted by <span className="text-white font-bold">50K+</span> users worldwide
              </p>
            </div>
          </motion.div>

          {/* Hero Standalone Image with HUD circles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center items-center w-full h-[550px] lg:h-[750px]"
          >
            {/* Glowing background */}
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-neon-blue/5 rounded-full blur-[60px] opacity-60 pointer-events-none" />
            
            {/* Concentric Rotating HUD Circles */}
            <div className="absolute w-[360px] sm:w-[500px] lg:w-[680px] h-[360px] sm:h-[500px] lg:h-[680px] border border-neon-green/15 rounded-full animate-[spin_40s_linear_infinite] flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-[85%] border border-dashed border-neon-blue/15 rounded-full flex items-center justify-center">
                <div className="w-[75%] h-[75%] border border-double border-neon-green/5 rounded-full" />
              </div>
            </div>
            
            {/* Standalone Girl FitGen image */}
            <img
              src="/images/girlfitgen.png"
              alt="FitGen AI Coach"
              className="relative max-h-[520px] lg:max-h-[720px] w-auto object-contain z-10 drop-shadow-[0_0_45px_rgba(57,255,20,0.25)]"
            />
          </motion.div>
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

      {/* Testimonials */}
      <section className="py-24 border-t border-white/5 bg-[#05070c]/50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center flex flex-col gap-4 mb-20">
            <h2 className="text-xs font-bold text-neon-green uppercase tracking-widest">Testimonials</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Loved By Athletes Everywhere</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-panel rounded-3xl p-6 border border-white/5 bg-white/2"
              >
                <div className="flex items-center gap-1 mb-4 text-neon-green">
                  {Array.from({ length: test.rating }).map((_, j) => (
                    <Sparkles key={j} className="w-4 h-4 fill-neon-green" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{test.text}"</p>
                <div>
                  <h5 className="font-bold text-sm text-white">{test.name}</h5>
                  <p className="text-xs text-gray-500">{test.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
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
              className={`glass-panel rounded-[30px] p-8 border ${
                card.popular ? 'border-neon-green/40 shadow-[0_0_30px_rgba(57,255,20,0.05)]' : 'border-white/5'
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
                className={`w-full text-center py-3.5 rounded-full font-bold transition-all duration-300 cursor-pointer ${
                  card.popular
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
