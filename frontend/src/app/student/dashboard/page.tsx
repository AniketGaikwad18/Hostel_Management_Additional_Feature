'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSocketListener } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { StudentProfile } from '@/lib/types';
import { 
  QrCode, 
  DoorClosed, 
  CreditCard, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ShieldAlert, 
  RefreshCw,
  Building2,
  FileText,
  Send,
  Sparkles
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sosSending, setSosSending] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.student.getMe();
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = setInterval(fetchProfile, 4000);
    return () => clearInterval(interval);
  }, []);

  useSocketListener('MOVEMENT_UPDATE', (payload) => {
    if (payload.student_id === profile?.id || payload.student_code === profile?.student_code) {
      fetchProfile();
    }
  });

  const handleSos = async () => {
    if (!confirm('Are you sure you want to trigger an emergency SOS alert to the Warden?')) return;
    setSosSending(true);
    try {
      await api.emergency.trigger({
        location: `${profile?.block_name || 'Block B'} • Room ${profile?.room_number || 'B-204'}`,
        message: 'Student pressed immediate emergency distress button.'
      });
      setSosSent(true);
      setTimeout(() => setSosSent(false), 8000);
    } catch (e: any) {
      alert('Failed to send SOS: ' + e.message);
    } finally {
      setSosSending(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-[#FF6B2B] animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-[#A89F8F]">Loading residential dashboard...</p>
      </div>
    );
  }

  const isInside = profile?.current_status === 'INSIDE';

  return (
    <div className="space-y-6">
      {/* Top Greeting & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider">
            {profile?.student_code || 'STU001'} • {profile?.course || 'B.Tech CS'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#FAF8F5] mt-0.5">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'Aniket'}
          </h1>
        </div>

        {/* SOS Button */}
        <button
          onClick={handleSos}
          disabled={sosSending || sosSent}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
            sosSent
              ? 'bg-emerald-500 text-black'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{sosSent ? '✓ SOS TRANSMITTED' : sosSending ? 'Sending...' : 'EMERGENCY SOS'}</span>
        </button>
      </div>

      {/* Prominent High-Visibility MY QR Pass Card */}
      <Link
        href="/student/qr"
        className="block bg-gradient-to-r from-[#0F1A29] via-[#142235] to-[#0A121D] border-2 border-[#FF6B2B]/40 hover:border-[#FF6B2B] rounded-2xl p-5 sm:p-6 transition shadow-xl relative overflow-hidden group"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#FF6B2B] text-white font-extrabold text-[10px] tracking-wide uppercase font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Tap To Open Gate Pass</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#FAF8F5]">
              MY QR IDENTITY
            </h2>
            <p className="text-xs sm:text-sm text-[#C8C1B3] max-w-md">
              Present your dynamic, tokenized QR code to the Warden scanner for instant gate movement.
            </p>
          </div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FF6B2B] text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition shadow-lg shadow-[#FF6B2B]/30">
            <QrCode className="w-9 h-9 sm:w-11 sm:h-11" />
          </div>
        </div>
      </Link>

      {/* Core Status & Operations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Hostel Movement Status Card */}
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#A89F8F] uppercase tracking-wider font-mono">
                Hostel Status
              </span>
              <DoorClosed className="w-4 h-4 text-[#A89F8F]" />
            </div>

            <div className="flex items-center space-x-3 my-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                isInside ? 'bg-emerald-400/20' : 'bg-[#FF6B2B]/20'
              }`}>
                <div className={`w-2.5 h-2.5 rounded-full ${
                  isInside ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF6B2B]'
                }`} />
              </div>
              <span className={`text-2xl font-black tracking-tight ${
                isInside ? 'text-emerald-400' : 'text-[#FF6B2B]'
              }`}>
                {profile?.current_status || 'OUTSIDE'}
              </span>
            </div>
            
            <p className="text-xs text-[#A89F8F] mt-1">
              {isInside
                ? 'Verified inside campus premises.'
                : 'Checked out through main perimeter gate.'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#18283E] space-y-1.5 text-[11px] text-[#A89F8F] font-mono">
            <div className="flex justify-between">
              <span>Last Check-In:</span>
              <span className="text-[#FAF8F5]">
                {profile?.last_entry_at ? new Date(profile.last_entry_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None recorded'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Last Departure:</span>
              <span className="text-[#FAF8F5]">
                {profile?.last_exit_at ? new Date(profile.last_exit_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'None recorded'}
              </span>
            </div>
          </div>
        </div>

        {/* Room Details Card */}
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#A89F8F] uppercase tracking-wider font-mono">
                Assigned Quarters
              </span>
              <Building2 className="w-4 h-4 text-[#A89F8F]" />
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-[#FAF8F5]">
                {profile?.room_number || 'B-204'}
              </div>
              <div className="text-xs text-[#C8C1B3]">
                {profile?.block_name || 'Block B'} • Bed {profile?.bed_number || 'B1'}
              </div>
            </div>

            <p className="text-xs text-[#A89F8F] mt-2">
              Aryabhatta Residential Complex
            </p>
          </div>

          <Link
            href="/student/room"
            className="mt-4 pt-3 border-t border-[#18283E] flex items-center justify-between text-xs text-[#FF6B2B] font-semibold hover:underline"
          >
            <span>View Room & Roommates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Fees Ledger Card */}
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#A89F8F] uppercase tracking-wider font-mono">
                Hostel Dues
              </span>
              <CreditCard className="w-4 h-4 text-[#A89F8F]" />
            </div>

            <div className="my-2">
              <div className="text-2xl font-black text-[#FAF8F5] font-mono">
                ₹{((profile?.outstanding_fee_amount || 0) + (profile?.total_fines_amount || 0)).toLocaleString()}
              </div>
              <div className="text-xs text-[#A89F8F]">
                {profile?.outstanding_fee_amount ? 'Semester Maintenance Balance' : 'Zero outstanding balance'}
              </div>
            </div>

            {profile?.total_fines_amount ? (
              <div className="mt-2 text-[11px] px-2.5 py-1 rounded bg-[#FF6B2B]/15 text-[#FF6B2B] inline-block font-semibold border border-[#FF6B2B]/30 font-mono">
                ⚠️ ₹{profile.total_fines_amount} pending citation fine
              </div>
            ) : null}
          </div>

          <Link
            href="/student/fees"
            className="mt-4 pt-3 border-t border-[#18283E] flex items-center justify-between text-xs text-[#FF6B2B] font-semibold hover:underline"
          >
            <span>View Breakdown & Settle</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Secondary Fast Action Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/student/complaints"
          className="bg-[#0F1A29] border border-[#18283E] hover:border-[#FF6B2B] p-4 rounded-xl text-center transition"
        >
          <div className="text-base font-bold text-[#FAF8F5] mb-0.5">Tickets</div>
          <div className="text-xs text-[#A89F8F]">{profile?.pending_complaints_count || 0} In Progress</div>
        </Link>

        <Link
          href="/student/activity"
          className="bg-[#0F1A29] border border-[#18283E] hover:border-[#FF6B2B] p-4 rounded-xl text-center transition"
        >
          <div className="text-base font-bold text-[#FAF8F5] mb-0.5">Movement Log</div>
          <div className="text-xs text-[#A89F8F]">Perimeter History</div>
        </Link>

        <Link
          href="/student/leave"
          className="bg-[#0F1A29] border border-[#18283E] hover:border-[#FF6B2B] p-4 rounded-xl text-center transition"
        >
          <div className="text-base font-bold text-[#FAF8F5] mb-0.5">Gate Pass</div>
          <div className="text-xs text-[#A89F8F]">Request Outstation</div>
        </Link>

        <Link
          href="/student/announcements"
          className="bg-[#0F1A29] border border-[#18283E] hover:border-[#FF6B2B] p-4 rounded-xl text-center transition"
        >
          <div className="text-base font-bold text-[#FAF8F5] mb-0.5">Notices</div>
          <div className="text-xs text-[#A89F8F]">Hostel Circulars</div>
        </Link>
      </div>
    </div>
  );
}
