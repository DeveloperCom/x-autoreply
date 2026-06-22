'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  MessageSquare,
  History,
  User,
  Settings
} from 'lucide-react';
import ProfileSettings from '@/components/custom/ProfileSettings';
import ModelsConfig from '@/components/custom/ModelsConfig';
import CategoriesConfig from '@/components/custom/CategoriesConfig';
import TonesConfig from '@/components/custom/TonesConfig';

type Tone = {
  id: string;
  name: string;
  description: string;
  goal: string;
};

type Category = {
  id: string;
  name: string;
};

type TargetModel = {
  id: string;
  name: string;
  value: string;
};

export default function OverviewDashboard() {
  // Stats / Global loading
  const [postsCount, setPostsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [xUsername, setXUsername] = useState('');

  // Models state
  const [models, setModels] = useState<TargetModel[]>([]);

  // Tones state
  const [tones, setTones] = useState<Tone[]>([]);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);

  const handleToggleSettings = () => {
    const el = document.getElementById('engine-control-panel');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [postsRes, settingsRes, modelsRes, tonesRes, categoriesRes] = await Promise.all([
        fetch('/api/posts'),
        fetch('/api/settings'),
        fetch('/api/models'),
        fetch('/api/tones'),
        fetch('/api/categories')
      ]);

      if (postsRes.ok) {
        const posts = await postsRes.json();
        setPostsCount(Array.isArray(posts) ? posts.length : 0);
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setXUsername(settings.xUsername || '');
      }

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData);
      }

      if (tonesRes.ok) {
        const tonesData = await tonesRes.json();
        setTones(tonesData);
      }

      if (categoriesRes.ok) {
        const catData = await categoriesRes.json();
        setCategories(catData);
      }
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Overview</h2>
        <p className="text-xs text-neutral-400">Manage growth profiles, routing models, and settings presets.</p>
      </div>

      {/* Ultra-Compact Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Style Memory Summary */}
        <div className="bg-[#18181b]/50 border border-[#27272a] rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 shrink-0">
            <History className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">Style Memory</span>
            <span className="text-base font-bold text-white block mt-0.5">{loading ? '...' : `${postsCount} Posts`}</span>
          </div>
        </div>

        {/* X Profile Summary */}
        <div className="bg-[#18181b]/50 border border-[#27272a] rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">Target Profile</span>
            <span className="text-base font-bold text-white block mt-0.5 truncate">
              {loading ? '...' : xUsername ? `@${xUsername}` : 'Not configured'}
            </span>
          </div>
        </div>

        {/* Engine Config Summary */}
        <div className="bg-[#18181b]/50 border border-[#27272a] rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Settings className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">Active Configs</span>
            <span className="text-[11px] font-bold text-white block mt-0.5">
              {tones.length} Tones · {models.length} Models · {categories.length} Cats
            </span>
          </div>
        </div>
      </div>

      {/* Premium App Icon View - Responsive for both Mobile & Desktop */}
      <div className="space-y-3">
        <h3 className="text-[10px] md:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-1">Quick Actions</h3>
        <div className="bg-gradient-to-b from-[#18181b]/40 to-[#09090b]/60 border border-[#27272a]/40 rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] backdrop-blur-md">
          <div className="grid grid-cols-4 gap-2 md:gap-8 justify-items-center max-w-lg md:max-w-2xl mx-auto">

            <Link href="/generate" className="flex flex-col items-center group select-none cursor-pointer">
              <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-[#6366F1] to-[#A855F7] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)] md:shadow-[0_8px_20px_rgba(99,102,241,0.4)] border border-white/10 transform transition-all duration-200 group-hover:scale-105 active:scale-95">
                <Sparkles className="h-6 w-6 md:h-9 md:w-9 text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-semibold mt-2 md:mt-3 text-neutral-300 group-hover:text-white transition-colors text-center truncate w-16 md:w-24">
                Generator
              </span>
            </Link>

            <Link href="/replies" className="flex flex-col items-center group select-none cursor-pointer">
              <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#06B6D4] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(59,130,246,0.4)] md:shadow-[0_8px_20px_rgba(59,130,246,0.4)] border border-white/10 transform transition-all duration-200 group-hover:scale-105 active:scale-95">
                <MessageSquare className="h-6 w-6 md:h-9 md:w-9 text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-semibold mt-2 md:mt-3 text-neutral-300 group-hover:text-white transition-colors text-center truncate w-16 md:w-24">
                Replies
              </span>
            </Link>

            <Link href="/history" className="flex flex-col items-center group select-none cursor-pointer">
              <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-[#10B981] to-[#3B82F6] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(16,185,129,0.4)] md:shadow-[0_8px_20px_rgba(16,185,129,0.4)] border border-white/10 transform transition-all duration-200 group-hover:scale-105 active:scale-95">
                <History className="h-6 w-6 md:h-9 md:w-9 text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-semibold mt-2 md:mt-3 text-neutral-300 group-hover:text-white transition-colors text-center truncate w-16 md:w-24">
                Memory
              </span>
            </Link>

            <button onClick={handleToggleSettings} className="flex flex-col items-center group select-none cursor-pointer focus:outline-none">
              <div className="h-14 w-14 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-[#EC4899] to-[#F59E0B] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(236,72,153,0.4)] md:shadow-[0_8px_20px_rgba(236,72,153,0.4)] border border-white/10 transform transition-all duration-200 group-hover:scale-105 active:scale-95">
                <Settings className="h-6 w-6 md:h-9 md:w-9 text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-semibold mt-2 md:mt-3 text-neutral-300 group-hover:text-white transition-colors text-center truncate w-16 md:w-24">
                Settings
              </span>
            </button>

          </div>
        </div>
      </div>
      {/* Engine Control Panel - Independent Custom Components */}
      <div id="engine-control-panel" className="space-y-6">
        <ProfileSettings xUsername={xUsername} onRefresh={loadDashboardData} />
        <ModelsConfig models={models} onRefresh={loadDashboardData} />
        <CategoriesConfig categories={categories} onRefresh={loadDashboardData} />
        <TonesConfig tones={tones} onRefresh={loadDashboardData} />
      </div>
    </div>
  );
}
