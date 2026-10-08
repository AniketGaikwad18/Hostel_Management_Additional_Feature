'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  QrCode, 
  MessageSquareWarning, 
  CreditCard, 
  User, 
  LogOut, 
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/student/dashboard', icon: Home },
  { label: 'Gate QR', href: '/student/qr', icon: QrCode, highlight: true },
  { label: 'Tickets', href: '/student/complaints', icon: MessageSquareWarning },
  { label: 'Dues', href: '/student/fees', icon: CreditCard },
  { label: 'Profile', href: '/student/profile', icon: User },
];

function StudentMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0A121D]/95 backdrop-blur-xl border-t border-[#18283E] px-3 py-2">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-13 h-13 rounded-full bg-[#FF6B2B] text-white flex items-center justify-center shadow-lg shadow-[#FF6B2B]/30 border-4 border-[#060B12]">
                  <Icon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#FF6B2B] mt-1 font-mono uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition ${
                isActive ? 'text-[#FF6B2B]' : 'text-[#A89F8F] hover:text-[#FAF8F5]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?role=student');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#060B12] flex items-center justify-center text-[#A89F8F] font-mono text-xs">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FF6B2B] mr-3" />
        <span>Loading Resident Session...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B12] text-[#F3EFE6] flex flex-col pb-20 md:pb-0 selection:bg-[#FF6B2B] selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-[#18283E] bg-[#0A121D]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0F1A29] border border-[#223755] flex items-center justify-center font-black text-[#FF6B2B] text-sm">
              H
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#FAF8F5] block leading-tight">
                HOSTELSPHERE
              </span>
              <span className="text-[10px] text-[#A89F8F] font-mono font-semibold tracking-wider uppercase block">
                Resident Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/student/qr"
              className="flex items-center space-x-1.5 bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md shadow-[#FF6B2B]/20 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>MY QR</span>
            </Link>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-[#A89F8F] hover:text-white rounded-lg hover:bg-[#142235] transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto w-full px-4 py-6 flex-1">
        <Suspense fallback={<div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading view...</div>}>
          {children}
        </Suspense>
      </main>

      {/* Bottom Mobile Navigation Bar wrapped in Suspense */}
      <Suspense fallback={null}>
        <StudentMobileNav />
      </Suspense>
    </div>
  );
}
