'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutGrid, 
  QrCode, 
  Activity, 
  Users, 
  Building2, 
  MessageSquare, 
  CreditCard, 
  AlertTriangle, 
  FileText, 
  Megaphone, 
  ShieldAlert, 
  BarChart2,
  Settings,
  Search,
  Bell,
  Sun,
  ChevronDown,
  LogOut,
  Building
} from 'lucide-react';

const menuItems = [
  { label: 'Operations Center', href: '/warden/dashboard', icon: LayoutGrid },
  { label: 'Gate Camera Scanner', href: '/warden/scanner', icon: QrCode },
  { label: 'Live Gate Movement', href: '/warden/live-hostel', icon: Activity },
  { label: 'Resident Students', href: '/warden/students', icon: Users },
  { label: 'Rooms & Occupancy', href: '/warden/rooms', icon: Building2 },
  { label: 'Complaints & Kanban', href: '/warden/complaints', icon: MessageSquare },
  { label: 'Fee Collections', href: '/warden/fees', icon: CreditCard },
  { label: 'Disciplinary Fines', href: '/warden/fines', icon: AlertTriangle },
  { label: 'Gate & Leave Passes', href: '/warden/leave', icon: FileText },
  { label: 'Notice Announcements', href: '/warden/announcements', icon: Megaphone },
  { label: 'Emergency Alerts (SOS)', href: '/warden/emergency', icon: ShieldAlert },
  { label: 'Analytics & Reports', href: '/warden/analytics', icon: BarChart2 },
];

function WardenTopBar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 border-b border-[#14202E] bg-[#080E15] px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Brand */}
      <div className="flex items-center space-x-3 w-64">
        <div className="w-9 h-9 rounded-xl bg-[#0D1722] border border-[#22354A] flex items-center justify-center text-[#FF7337] shadow-md">
          {/* Hexagonal / Emblem Brand Mark */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" />
            <path d="M12 7v10" />
            <path d="M8 10h8" />
          </svg>
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight text-[#FAF8F5] block leading-tight">
            HOSTELSPHERE
          </span>
          <span className="text-[10px] text-[#8692A3] font-medium tracking-wider block">
            One Hostel. One Platform.
          </span>
        </div>
      </div>

      {/* Center: Search Bar with Ctrl+K */}
      <div className="flex-1 max-w-xl mx-8 hidden md:block">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#8692A3] absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, room, complaint..."
            className="w-full bg-[#0D1722] border border-[#182637] rounded-xl pl-10 pr-16 py-2 text-xs text-[#FAF8F5] placeholder-[#667484] focus:outline-none focus:border-[#FF7337] transition"
          />
          <div className="absolute right-3 flex items-center pointer-events-none">
            <span className="text-[10px] font-mono text-[#8692A3] bg-[#14202E] border border-[#22354A] px-1.5 py-0.5 rounded">
              Ctrl + K
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button 
          title="Notifications"
          className="relative p-2 rounded-xl text-[#8692A3] hover:text-[#FAF8F5] hover:bg-[#0D1722] transition"
        >
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 rounded-full bg-[#FF7337] absolute top-2 right-2 ring-2 ring-[#080E15]" />
        </button>

        {/* User Pill / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-[#0D1722] transition text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#FAF8F5] text-[#0A1118] flex items-center justify-center font-bold text-xs shadow-sm">
              WS
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold text-[#FAF8F5] block leading-tight">
                {user?.full_name?.split(' ')[0] || 'Warden'}
              </span>
              <span className="text-[10px] text-[#8692A3] block leading-tight">
                Main Hostel
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#8692A3]" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0D1722] border border-[#182637] rounded-xl shadow-2xl py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#182637]">
                <p className="font-bold text-[#FAF8F5]">{user?.full_name || 'Chief Warden'}</p>
                <p className="text-[10px] text-[#8692A3] font-mono">{user?.username || 'WARDEN001'}</p>
              </div>
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center space-x-2 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          title="Toggle Theme"
          className="p-2 rounded-xl bg-[#0D1722] border border-[#182637] text-[#FFB800] hover:border-[#FF7337] transition"
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

function WardenSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[#14202E] bg-[#070D14] flex flex-col justify-between hidden md:flex sticky top-16 h-[calc(100vh-4rem)] z-40 overflow-y-auto custom-scrollbar">
      <div className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/warden/dashboard' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs transition duration-150 ${
                isActive
                  ? 'bg-[#FF7337] text-[#080E15] font-extrabold shadow-md shadow-[#FF7337]/20'
                  : 'text-[#9AA3AF] hover:text-[#FAF8F5] hover:bg-[#0D1722] font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#080E15]' : 'text-[#8692A3]'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7787] font-mono">
            SYSTEM
          </span>
        </div>

        <Link
          href="/warden/dashboard"
          className="flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs text-[#9AA3AF] hover:text-[#FAF8F5] hover:bg-[#0D1722] font-medium transition"
        >
          <Settings className="w-4 h-4 text-[#8692A3]" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Bottom Architectural Card from reference image */}
      <div className="p-3">
        <div className="bg-[#0C1520] border border-[#162334] rounded-2xl p-3 shadow-lg overflow-hidden">
          <div className="relative w-full h-24 rounded-xl overflow-hidden mb-2.5 border border-[#1E2E42]">
            <img 
              src="/images/sidebar_building.jpg" 
              alt="HostelSphere Campus" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition duration-500"
            />
          </div>

          <div className="flex items-center space-x-2 mb-1.5">
            <div className="w-4 h-4 rounded bg-[#FF7337] flex items-center justify-center text-[10px] text-black font-black">
              H
            </div>
            <span className="text-xs font-bold text-[#FAF8F5] tracking-tight">
              HOSTELSPHERE
            </span>
            <span className="text-[9px] font-mono text-[#8692A3]">v1.0.0</span>
          </div>

          <div className="space-y-0.5 text-[10px] text-[#8692A3] leading-tight">
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#FF7337]" />
              Smart Management
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#10B981]" />
              Safer Hostels
            </p>
            <p className="flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#38BDF8]" />
              Happier Students
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function WardenLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login?role=warden');
      } else if (user.role !== 'WARDEN' && user.role !== 'ADMIN') {
        router.push('/student/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#070D14] flex items-center justify-center text-[#8692A3] font-mono text-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF7337] mr-3" />
        <span>Loading Warden Operations Center...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070D14] text-[#F3EFE6] flex flex-col selection:bg-[#FF7337] selection:text-white">
      {/* Top Bar with brand, search & user controls */}
      <Suspense fallback={<div className="h-16 bg-[#080E15] border-b border-[#14202E]" />}>
        <WardenTopBar />
      </Suspense>

      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        {/* Left Navigation Sidebar */}
        <Suspense fallback={<div className="w-64 bg-[#070D14] border-r border-[#14202E]" />}>
          <WardenSidebar />
        </Suspense>

        {/* Main Content Area */}
        <main className="flex-1 p-5 sm:p-6 lg:p-7 min-w-0 max-w-[1600px] w-full mx-auto">
          <Suspense fallback={<div className="p-8 text-center text-[#8692A3] font-mono text-xs">Loading operational dashboard...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
