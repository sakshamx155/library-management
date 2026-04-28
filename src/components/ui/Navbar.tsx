"use client";

import Link from "next/link";
import { BookMarked, ShieldCheck, Sun, Moon, Flame, Trophy, Medal, Target, Lock, Network, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.refresh(); // Important to refresh Server Components expecting cookies to drop
      router.push('/login');
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-center h-20 px-6 backdrop-blur-xl bg-background/70 border-b border-white/10 dark:border-white/5 shadow-sm dark:bg-background/80">
      <div className="w-full max-w-7xl flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-80"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
            <BookMarked className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-none tracking-tight text-foreground">
              EduLibrary
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-primary mt-1">
              Resource Portal
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-sm">
            <Flame className="h-4 w-4" /> 12 Day Streak
          </div>

          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 text-foreground transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          <Link
            href="/network"
            className="hidden lg:flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-primary/10 text-primary px-4 py-2 text-sm font-bold transition-all hover:bg-primary hover:text-white"
          >
            <Network className="h-4 w-4" />
            Knowledge Graph
          </Link>
          
          <Link
            href="/admin"
            className="hidden sm:flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 py-2 text-sm font-medium transition-all hover:bg-black/10 dark:hover:bg-white/10"
          >
            <ShieldCheck className="h-4 w-4 text-accent" />
            Admin Portal
          </Link>
          
          <div className="relative group cursor-pointer">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px] shadow-sm transform transition-transform group-hover:scale-105">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-background relative overflow-hidden">
                <span className="text-xs font-bold text-foreground">S</span>
              </div>
            </div>
            
            {/* Gamification Hover Popover */}
            <div className="absolute right-0 top-12 w-64 p-4 rounded-2xl bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px]">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
                    <span className="text-sm font-bold text-foreground">S</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-sm">Saksham</h4>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1"><Trophy className="h-3 w-3 text-amber-500"/> Level 12 Reader</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground uppercase tracking-wider">Earned Badges</span>
                  <span className="text-primary font-bold">2/15</span>
                </div>
                <div className="flex gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center border border-blue-500/20"><Medal className="h-5 w-5" /></div>
                    <span className="text-[9px] font-bold text-center leading-tight max-w-[40px]">Topic Master</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="h-10 w-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center border border-purple-500/20"><Target className="h-5 w-5" /></div>
                    <span className="text-[9px] font-bold text-center leading-tight max-w-[40px]">Speed Reader</span>
                  </div>
                  <div className="opacity-40 flex flex-col items-center gap-1 grayscale">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-black/10 dark:border-white/10"><Lock className="h-5 w-5" /></div>
                    <span className="text-[9px] font-bold text-center leading-tight max-w-[40px]">Locked</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-black/5 dark:border-white/10">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors text-xs font-bold">
                  <LogOut className="h-3 w-3" /> Sign Out
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
