'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Activity, User as UserIcon } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

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

    window.addEventListener('scroll', handleScroll);
    checkAuth();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#030408]/80 backdrop-blur-md border-b border-white/5 py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-2xl tracking-wider text-white">
            FitGen <span className="text-neon-green">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 font-medium">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
            About
          </Link>
          <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
            Pricing
          </Link>
          
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-neon-green/30 bg-neon-green/10 text-neon-green font-semibold hover:bg-neon-green hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(57,255,20,0.1)] hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105"
            >
              <UserIcon className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 rounded-full bg-neon-green text-black font-bold hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.2)]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 absolute top-full left-0 right-0 py-6 px-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-5 duration-200">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white text-lg transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white text-lg transition-colors"
          >
            About
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsOpen(false)}
            className="text-gray-300 hover:text-white text-lg transition-colors"
          >
            Pricing
          </Link>
          <hr className="border-white/10" />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-neon-green/30 bg-neon-green/10 text-neon-green font-semibold"
            >
              <UserIcon className="w-4 h-4" />
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-center py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="text-center py-3 rounded-xl bg-neon-green text-black font-bold"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
