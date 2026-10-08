'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { QrPreviewData } from '@/lib/types';
import { 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  ArrowRight, 
  ShieldAlert, 
  RefreshCw,
  Lock,
  Building2,
  UserCheck
} from 'lucide-react';

function ScanComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const tokenParam = searchParams.get('token');
  const [token, setToken] = useState<string>(tokenParam || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [preview, setPreview] = useState<QrPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tokenParam) {
      setToken(tokenParam);
      validateToken(tokenParam);
    }
  }, [tokenParam]);

  const validateToken = async (tokenToTest: string) => {
    if (!tokenToTest.trim()) {
      setError('Please provide a student QR token');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.qr.validatePublic(tokenToTest.trim());
      setPreview(res.data);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired QR identity token');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateToken(token);
  };

  const handleProceedToWarden = () => {
    if (user && (user.role === 'WARDEN' || user.role === 'ADMIN')) {
      if (preview?.student_id) {
        router.push(`/warden/students/${preview.student_id}?source=qr`);
      }
    } else {
      router.push(`/login?role=warden&studentToken=${encodeURIComponent(token)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#060B12] text-[#F3EFE6] flex flex-col justify-between selection:bg-[#FF6B2B] selection:text-white">
      {/* Header */}
      <header className="border-b border-[#18283E] bg-[#0A121D]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F1A29] border border-[#223755] flex items-center justify-center font-black text-[#FF6B2B]">
              H
            </div>
            <span className="font-extrabold text-sm tracking-tight text-[#FAF8F5]">
              HOSTELSPHERE
            </span>
          </Link>

          <div className="text-[11px] font-mono text-[#A89F8F] uppercase tracking-wider">
            PERIMETER GATEWAY
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-10 h-10 text-[#FF6B2B] animate-spin mx-auto mb-4" />
            <p className="text-xs font-mono text-[#C8C1B3]">Resolving cryptographic token...</p>
          </div>
        )}

        {!loading && preview && (
          <div className="space-y-6">
            {/* Verification Success Badge */}
            <div className="bg-[#0A121D] border-2 border-[#18283E] rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#FAF8F5]">QR DETECTED ✓</h2>
                  <p className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    IDENTITY CONFIRMED ON CLUSTER
                  </p>
                </div>
              </div>

              {/* Student Identification Cards */}
              <div className="space-y-3 mb-6">
                <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
                  <span className="text-[10px] uppercase font-bold text-[#A89F8F] tracking-wider block mb-1">
                    Student Resident
                  </span>
                  <div className="text-lg font-bold text-[#FAF8F5] flex items-center justify-between">
                    <span>{preview.student_name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#142235] text-[#C8C1B3] border border-[#223755]">
                      {preview.student_code}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0F1A29] p-3.5 rounded-xl border border-[#18283E]">
                    <span className="text-[10px] uppercase font-bold text-[#A89F8F] tracking-wider block mb-1">
                      Assigned Room
                    </span>
                    <span className="text-sm font-bold text-[#FAF8F5]">
                      {preview.block_name} • {preview.room_number}
                    </span>
                  </div>

                  <div className="bg-[#0F1A29] p-3.5 rounded-xl border border-[#18283E]">
                    <span className="text-[10px] uppercase font-bold text-[#A89F8F] tracking-wider block mb-1">
                      Current Standing
                    </span>
                    <span className={`text-sm font-black flex items-center space-x-1.5 ${
                      preview.current_status === 'INSIDE' ? 'text-emerald-400' : 'text-[#FF6B2B]'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        preview.current_status === 'INSIDE' ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF6B2B]'
                      }`} />
                      <span>{preview.current_status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy Shield Banner */}
              <div className="p-3 bg-[#060B12] rounded-xl border border-[#18283E] text-[11px] text-[#A89F8F] flex items-start space-x-2.5 mb-6">
                <Lock className="w-4 h-4 text-[#FF6B2B] flex-shrink-0 mt-0.5" />
                <p>
                  Personal contact numbers, fees ledger, and movement authorization controls are shielded until Warden authentication.
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleProceedToWarden}
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold py-4 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-[#FF6B2B]/20 active:scale-[0.98]"
              >
                <span>
                  {user && (user.role === 'WARDEN' || user.role === 'ADMIN')
                    ? 'VERIFY STUDENT DOSSIER'
                    : 'CONTINUE TO WARDEN LOGIN'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={() => setPreview(null)}
                className="text-xs text-[#A89F8F] hover:text-[#FAF8F5] transition"
              >
                ← Scan or resolve alternative token
              </button>
            </div>
          </div>
        )}

        {/* Fallback & Manual Input State */}
        {!loading && !preview && (
          <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0F1A29] border border-[#223755] text-[#FF6B2B] flex items-center justify-center mx-auto mb-3 shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#FAF8F5]">Hostel Perimeter Gate</h2>
              <p className="text-xs text-[#A89F8F] mt-1 font-mono">
                Optical QR scanner & cryptographic token validator
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1.5 flex items-center justify-between">
                  <span>Cryptographic Token</span>
                  <span className="text-[10px] text-[#A89F8F] font-mono">Manual Ingestion</span>
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="e.g. hs_sec_aniket_stu001_demo"
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-4 py-3 text-xs text-[#FAF8F5] placeholder-[#6B6355] focus:outline-none focus:border-[#FF6B2B] transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-[#FF6B2B]/20 active:scale-[0.98]"
              >
                <span>Validate Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pre-load Button */}
            <div className="mt-6 pt-5 border-t border-[#18283E]">
              <span className="text-[10px] uppercase font-bold text-[#A89F8F] tracking-wider block mb-2 font-mono">
                Presentation Shortcut
              </span>
              <button
                type="button"
                onClick={() => {
                  const demoToken = 'hs_sec_aniket_stu001_demo';
                  setToken(demoToken);
                  validateToken(demoToken);
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-[#0F1A29] hover:bg-[#142235] border border-[#18283E] hover:border-[#223755] text-xs text-[#C8C1B3] font-medium transition flex items-center justify-between"
              >
                <span>Pre-load Demo Student (Aniket Gaikwad)</span>
                <span className="text-[10px] font-mono text-[#FF6B2B]">STU001</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#18283E] py-4 text-center text-xs text-[#A89F8F] font-mono">
        HOSTELSPHERE SECURE GATEWAY • CLUSTER ACTIVE
      </footer>
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060B12] text-[#F3EFE6] flex items-center justify-center font-mono text-xs">Loading gateway...</div>}>
      <ScanComponent />
    </Suspense>
  );
}
