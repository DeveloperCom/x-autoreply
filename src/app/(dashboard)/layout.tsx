'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  History,
  MessageSquare,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.replace('/passkey');
      toast.success('Logged out successfully!');
    } catch {
      toast.error('Unable to Logout');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Post Generator', href: '/generate', icon: Sparkles },
    { name: 'Smart Replies', href: '/replies', icon: MessageSquare },
    { name: 'Post History', href: '/history', icon: History },
  ];

  return (
    <div className="h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col md:flex-row font-sans dark select-none overflow-hidden">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#09090b] border-r border-[#27272a] p-6 shrink-0 h-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-lg text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">X-Reply</h1>
            <p className="text-xs text-neutral-400 font-medium">Growth Hub v2.0</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-[#27272a]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Content Column Wrapper */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Top Bar for Mobile */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#09090b] border-b border-[#27272a] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            <h1 className="font-bold tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">X-Reply Engine</h1>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-neutral-900 text-red-400 hover:bg-neutral-800 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto pb-24 md:pb-10">
          <div className="max-w-4xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Navigation for Mobile (Sticky Bottom) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#09090b]/90 backdrop-blur-md border-t border-[#27272a] grid grid-cols-4 py-2 z-50">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-500' : 'text-neutral-500'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.name.split(' ')[0]}
              </Link>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
