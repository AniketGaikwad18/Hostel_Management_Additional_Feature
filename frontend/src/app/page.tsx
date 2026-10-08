'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getApiBaseUrl } from '@/lib/api';
import { 
  ShieldCheck, 
  QrCode, 
  Users, 
  Building2, 
  ArrowRight, 
  Smartphone,
  Activity,
  Radio,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { login } = useAuth();
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [loggingInRole, setLoggingInRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkHealth() {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/health`, { method: 'GET' });
        if (res.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('disconnected');
        }
      } catch (e) {
        setBackendStatus('disconnected');
      }
    }
    checkHealth();
  }, []);

  const handleQuickLogin = async (username: string, pass: string, targetPath: string, roleName: string) => {
    try {
      setLoggingInRole(roleName);
      await login(username, pass);
      router.push(targetPath);
    } catch (err: any) {
      alert(`Authentication failed: ${err.message}`);
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B12] text-[#F3EFE6] flex flex-col justify-between selection:bg-[#FF6B2B] selection:text-white">
      {/* Top Operations Header */}
      <header className="border-b border-[#18283E] bg-[#0A121D]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A29] border border-[#223755] flex items-center justify-center font-black text-[#FF6B2B] text-xl shadow-lg shadow-[#060B12]/80">
              H
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-[#FAF8F5]">
                  HOSTELSPHERE
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#142235] text-[#A89F8F] border border-[#223755]">
                  OPERATIONS HUB
                </span>
              </div>
              <p className="text-[11px] text-[#A89F8F] font-medium tracking-wider uppercase">
                ONE HOSTEL. ONE PLATFORM.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs px-3.5 py-1.5 rounded-full border border-[#18283E] bg-[#0A121D]">
              <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : backendStatus === 'checking' ? 'bg-amber-400' : 'bg-rose-500'}`} />
              <span className="text-[#C8C1B3] font-mono text-[11px]">
                {backendStatus === 'connected' ? 'FASTAPI GATEWAY ONLINE' : backendStatus === 'checking' ? 'POLLING CORE...' : 'GATEWAY OFFLINE'}
              </span>
            </div>

            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-lg border border-[#223755] bg-[#0F1A29] hover:border-[#FF6B2B] hover:text-white transition text-[#C8C1B3]"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Operations Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-[#FF6B2B]/30 bg-[#FF6B2B]/10 text-[#FF6B2B] text-xs font-bold uppercase tracking-wider mb-6">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Collegiate Residential Operations System</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-[#FAF8F5]">
            Unified Residential Control,{' '}
            <span className="text-[#FF6B2B]">
              Zero Friction.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#A89F8F] max-w-2xl mx-auto leading-relaxed">
            Automated gate telemetry, tokenized cryptographic student passes, and immediate warden movement verification across residential quads.
          </p>
        </div>

        {/* 3 Core Operational Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full mb-16">
          {/* Student Portal Card */}
          <div className="bg-[#0F1A29] border border-[#18283E] rounded-2xl p-7 flex flex-col justify-between hover:border-[#FF6B2B]/60 transition duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B2B]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FF6B2B]/10 transition" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#142235] border border-[#223755] flex items-center justify-center text-[#FF6B2B] mb-5 shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B2B]">Mobile Optimized</span>
                <span className="text-xs text-[#A89F8F] font-mono">• STU001</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#FAF8F5]">Resident Student Portal</h2>
              <p className="text-xs sm:text-sm text-[#A89F8F] mb-6 leading-relaxed">
                Instant cryptographic gate pass, live hostel status indicator, maintenance tickets, and fee receipts.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleQuickLogin('STU001', 'student123', '/student/qr', 'Student')}
                disabled={loggingInRole !== null}
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-[#FF6B2B]/20 active:scale-[0.98]"
              >
                <span>{loggingInRole === 'Student' ? 'Authenticating...' : 'Launch Demo Student (Aniket)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex justify-between items-center text-[11px] text-[#A89F8F] font-mono px-1">
                <span>User: <strong className="text-[#FAF8F5]">STU001</strong></span>
                <span>Pass: <strong className="text-[#FAF8F5]">student123</strong></span>
              </div>
            </div>
          </div>

          {/* Warden Operations Center Card */}
          <div className="bg-[#0F1A29] border border-[#18283E] rounded-2xl p-7 flex flex-col justify-between hover:border-[#E4DDCF]/50 transition duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full pointer-events-none group-hover:bg-white/10 transition" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#142235] border border-[#223755] flex items-center justify-center text-[#FAF8F5] mb-5 shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#C8C1B3]">Operations Hub</span>
                <span className="text-xs text-[#A89F8F] font-mono">• WARDEN001</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#FAF8F5]">Warden Command Center</h2>
              <p className="text-xs sm:text-sm text-[#A89F8F] mb-6 leading-relaxed">
                Live perimeter gate telemetry, inside/outside headcounts, room occupancy matrix, and facility repairs.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleQuickLogin('WARDEN001', 'warden123', '/warden/dashboard', 'Warden')}
                disabled={loggingInRole !== null}
                className="w-full bg-[#FAF8F5] hover:bg-[#E4DDCF] text-[#060B12] font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-black/40 active:scale-[0.98]"
              >
                <span>{loggingInRole === 'Warden' ? 'Authenticating...' : 'Launch Warden Command Center'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex justify-between items-center text-[11px] text-[#A89F8F] font-mono px-1">
                <span>User: <strong className="text-[#FAF8F5]">WARDEN001</strong></span>
                <span>Pass: <strong className="text-[#FAF8F5]">warden123</strong></span>
              </div>
            </div>
          </div>

          {/* Universal QR Gate Scanner Card */}
          <div className="bg-[#0F1A29] border border-[#18283E] rounded-2xl p-7 flex flex-col justify-between hover:border-[#FF6B2B]/60 transition duration-300 relative group overflow-hidden md:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B2B]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FF6B2B]/10 transition" />
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#142235] border border-[#223755] flex items-center justify-center text-[#FF6B2B] mb-5 shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B2B]">Perimeter Gate</span>
                <span className="text-xs text-[#A89F8F] font-mono">• Optical & Token</span>
              </div>
              <h2 className="text-2xl font-bold mb-2 text-[#FAF8F5]">Universal Gate Scan</h2>
              <p className="text-xs sm:text-sm text-[#A89F8F] mb-6 leading-relaxed">
                Scan via native camera or resolve security token. Previews student verification and initiates warden gate control.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/scan"
                className="w-full bg-[#142235] hover:bg-[#1A2D46] border border-[#223755] hover:border-[#FF6B2B] text-[#FAF8F5] font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-md active:scale-[0.98]"
              >
                <span>Launch Scanner / Token Tester</span>
                <ArrowRight className="w-4 h-4 text-[#FF6B2B]" />
              </Link>
              <div className="text-[11px] text-center text-[#A89F8F]">
                Manual token entry & simulated scan supported
              </div>
            </div>
          </div>
        </div>

        {/* Master Presentation Sequence Strip */}
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-5 h-5 text-[#FF6B2B]" />
            <h3 className="font-bold text-base sm:text-lg text-[#FAF8F5]">
              Master Live Demonstration Pipeline
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-center">
            {[
              { step: '01', title: 'Student QR', sub: 'Aniket shows Pass' },
              { step: '02', title: 'Phone Camera', sub: 'Judge scans QR' },
              { step: '03', title: 'Masked Preview', sub: 'PII Protected' },
              { step: '04', title: 'Warden Login', sub: 'WARDEN001 Auth' },
              { step: '05', title: 'Mark Entry', sub: 'Toggle State INSIDE' },
              { step: '06', title: 'Log Ingestion', sub: 'SQL Log Created' },
              { step: '07', title: 'Live Sync', sub: 'Counters update live' },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-[#0F1A29] border border-[#18283E] rounded-xl flex flex-col justify-center">
                <span className="text-[10px] font-mono font-black text-[#FF6B2B] tracking-wider mb-1">{item.step}</span>
                <span className="text-xs font-bold text-[#FAF8F5] mb-0.5">{item.title}</span>
                <span className="text-[10px] text-[#A89F8F] leading-tight">{item.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#18283E] bg-[#0A121D] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A89F8F] gap-3">
          <p>© 2026 HOSTELSPHERE • University Residential Management System</p>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span>DARK MARINE + OAT + ORANGE</span>
            <span>0.0.0.0 LAN READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
