'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Shield, KeyRound, User as UserIcon, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const roleParam = searchParams.get('role');
  const studentTokenParam = searchParams.get('studentToken');

  const [activeTab, setActiveTab] = useState<'STUDENT' | 'WARDEN'>(
    roleParam === 'warden' ? 'WARDEN' : 'STUDENT'
  );
  const [username, setUsername] = useState('STU001');
  const [password, setPassword] = useState('student123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'STUDENT') {
      setUsername('STU001');
      setPassword('student123');
    } else {
      setUsername('WARDEN001');
      setPassword('warden123');
    }
    setError(null);
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(username, password);

      // Handle QR redirect flow if student token is attached
      if (studentTokenParam && (loggedUser.role === 'WARDEN' || loggedUser.role === 'ADMIN')) {
        try {
          const res = await api.qr.scanWarden(studentTokenParam);
          if (res.data?.student_id) {
            router.push(`/warden/students/${res.data.student_id}?source=qr`);
            return;
          }
        } catch (qrErr: any) {
          router.push('/warden/dashboard');
          return;
        }
      }

      if (loggedUser.role === 'WARDEN' || loggedUser.role === 'ADMIN') {
        router.push('/warden/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B12] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-[#F3EFE6] selection:bg-[#FF6B2B] selection:text-white">
      {/* Background marine ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] bg-[#142235]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A29] border border-[#223755] flex items-center justify-center font-black text-[#FF6B2B] text-xl shadow-lg">
              H
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-[#FAF8F5]">
              HOSTELSPHERE
            </span>
          </Link>
          <p className="text-xs text-[#A89F8F] font-mono tracking-wider uppercase">
            Institutional Authentication Gateway
          </p>
        </div>

        {/* QR Verification Context Alert */}
        {studentTokenParam && (
          <div className="mb-6 p-4 rounded-xl bg-[#0F1A29] border border-[#FF6B2B]/40 text-xs text-[#FAF8F5] flex items-center space-x-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-[#FF6B2B] flex-shrink-0" />
            <div>
              <p className="font-bold text-[#FF6B2B]">Student Token Detected</p>
              <p className="text-[#A89F8F]">Authenticate as Warden to verify and log perimeter movement.</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-7 shadow-2xl relative">
          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#060B12] rounded-xl mb-6 border border-[#18283E]">
            <button
              type="button"
              onClick={() => setActiveTab('STUDENT')}
              className={`py-2.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'STUDENT'
                  ? 'bg-[#142235] text-[#FAF8F5] border border-[#223755] shadow-sm'
                  : 'text-[#A89F8F] hover:text-[#FAF8F5]'
              }`}
            >
              Resident Student
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('WARDEN')}
              className={`py-2.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'WARDEN'
                  ? 'bg-[#FF6B2B] text-white shadow-sm'
                  : 'text-[#A89F8F] hover:text-[#FAF8F5]'
              }`}
            >
              Hostel Warden
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#C8C1B3] mb-1.5">
                {activeTab === 'STUDENT' ? 'Student ID' : 'Warden Employee Code'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#A89F8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder={activeTab === 'STUDENT' ? 'STU001' : 'WARDEN001'}
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] placeholder-[#6B6355] focus:outline-none focus:border-[#FF6B2B] font-mono transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#C8C1B3] mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#A89F8F] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl pl-10 pr-4 py-3 text-sm text-[#FAF8F5] placeholder-[#6B6355] focus:outline-none focus:border-[#FF6B2B] font-mono transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 active:scale-[0.98] mt-2 ${
                activeTab === 'STUDENT'
                  ? 'bg-[#142235] hover:bg-[#1A2D46] border border-[#223755] hover:border-[#FF6B2B] text-[#FAF8F5] shadow-lg'
                  : 'bg-[#FF6B2B] hover:bg-[#EA580C] text-white shadow-lg shadow-[#FF6B2B]/20'
              }`}
            >
              <span>{loading ? 'Validating Token...' : 'Authenticate & Enter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick autofill helper */}
          <div className="mt-6 pt-5 border-t border-[#18283E] flex justify-between text-[11px] font-mono text-[#A89F8F]">
            <span>ID: <strong className="text-[#FAF8F5]">{activeTab === 'STUDENT' ? 'STU001' : 'WARDEN001'}</strong></span>
            <span>PASS: <strong className="text-[#FAF8F5]">{activeTab === 'STUDENT' ? 'student123' : 'warden123'}</strong></span>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-[#A89F8F] hover:text-[#FAF8F5] transition">
            ← Return to Operations Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060B12] text-[#F3EFE6] flex items-center justify-center font-mono text-xs">Loading gateway...</div>}>
      <LoginForm />
    </Suspense>
  );
}
