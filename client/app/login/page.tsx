'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
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

      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 mt-16">
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
        <h2 className="text-center text-3xl font-extrabold text-white">Welcome Back</h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          New to FitGen AI?{' '}
          <Link href="/signup" className="font-medium text-neon-green hover:text-white transition-colors">
            Create an account here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
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

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-neon-green text-black font-extrabold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.15)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying Account...' : 'Sign In'}
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 text-center border-t border-white/5 pt-4">
            <ShieldCheck className="w-4 h-4 text-neon-green" />
            <span>Secure encryption protects all transmissions.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
