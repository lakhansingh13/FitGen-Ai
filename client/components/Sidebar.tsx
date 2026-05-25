'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Utensils,
  Flame,
  LineChart,
  Settings,
  LogOut,
  Activity,
  Menu,
  X,
  Award
} from 'lucide-react';

interface UserData {
  name: string;
  levelNumber: number;
  xp: number;
  streak: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, [pathname, router]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workout Plan', path: '/workout', icon: Calendar },
    { name: 'Diet Plan', path: '/diet', icon: Utensils },
    { name: 'AI Trainer', path: '/trainer', icon: Flame },
    { name: 'Progress Analytics', path: '/progress', icon: LineChart },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const nextLevelXp = (user?.levelNumber || 1) * 1000;
  const progressPercent = Math.min(100, Math.round(((user?.xp || 0) / nextLevelXp) * 100));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#05070c] border-r border-white/5 py-6 px-4">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shadow-lg">
          <Activity className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <span className="font-extrabold text-xl tracking-wider text-white">
          FitGen <span className="text-neon-green">AI</span>
        </span>
      </Link>

      {/* User Stats Card */}
      {user && (
        <div className="glass-panel rounded-2xl p-4 mb-6 border border-white/5 bg-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-neon-green/20 border border-neon-green/40 flex items-center justify-center font-bold text-neon-green text-lg">
              {user.name[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm text-white truncate max-w-[140px]">{user.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-neon-green font-medium">
                <Award className="w-3.5 h-3.5" />
                <span>Level {user.levelNumber}</span>
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>XP: {user.xp} / {nextLevelXp}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-green to-neon-blue transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          
          {/* Streak */}
          <div className="mt-3 flex items-center justify-between text-xs border-t border-white/5 pt-2 text-gray-400">
            <span>Workout Streak</span>
            <span className="text-neon-green font-bold flex items-center gap-1">
              🔥 {user.streak} Days
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-neon-green' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 mt-auto"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-black/50 border border-white/10 text-white backdrop-blur-md"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Panel for Desktop */}
      <div className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </div>

      {/* Sidebar Panel for Mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          {/* Sidebar Drawer */}
          <div className="relative w-64 h-full animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
