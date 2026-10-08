'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StudentProfile } from '@/lib/types';
import { 
  CheckCircle2, 
  AlertCircle, 
  DoorOpen, 
  DoorClosed, 
  Building2, 
  Phone, 
  Clock, 
  CreditCard, 
  AlertTriangle, 
  ArrowLeft,
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

function StudentDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const studentId = params.id as string;
  const isFromQr = searchParams.get('source') === 'qr';

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStudent = async () => {
    try {
      const res = await api.warden.getStudentDetail(studentId);
      setStudent(res.data);
    } catch (err: any) {
      console.error(err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to load student details' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const handleMarkEntry = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.movement.markEntry(studentId, 'Marked via Warden QR Verification');
      setActionMessage({
        type: 'success',
        text: `✓ ENTRY RECORDED FOR ${student?.full_name?.toUpperCase() || 'STUDENT'}`,
      });
      fetchStudent();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Student is already inside.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkExit = async () => {
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await api.movement.markExit(studentId, 'Marked via Warden QR Verification');
      setActionMessage({
        type: 'success',
        text: `✓ EXIT RECORDED FOR ${student?.full_name?.toUpperCase() || 'STUDENT'}`,
      });
      fetchStudent();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Student is already outside.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-8 h-8 text-[#FF6B2B] animate-spin mx-auto mb-3" />
        <p className="text-xs font-mono text-[#A89F8F]">Loading student dossier and security credentials...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-8 text-center">
        <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#FAF8F5] mb-2">Student Record Not Found</h2>
        <Link href="/warden/students" className="text-xs text-[#FF6B2B] underline font-mono">
          Return to Resident List
        </Link>
      </div>
    );
  }

  const isInside = student.current_status === 'INSIDE';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/warden/students"
          className="inline-flex items-center space-x-1.5 text-xs text-[#A89F8F] hover:text-[#FAF8F5] transition font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#FF6B2B]" />
          <span>Back to Students List</span>
        </Link>

        {isFromQr && (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FF6B2B]/15 text-[#FF6B2B] border border-[#FF6B2B]/30 flex items-center space-x-1.5 font-mono">
            <Sparkles className="w-3 h-3" />
            <span>QR Scan Verified Session</span>
          </span>
        )}
      </div>

      {/* Action Result Toast / Banner */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center space-x-3 transition shadow-xl ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/15 border-rose-500/40 text-[#EF4444]'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="font-mono">{actionMessage.text}</span>
        </div>
      )}

      {/* Primary Verification & Gate Movement Command Card */}
      <div className="bg-[#0A121D] border-2 border-[#18283E] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#18283E]">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#0F1A29] border-2 border-[#FF6B2B] flex items-center justify-center text-[#FAF8F5] font-black text-2xl shadow-xl shadow-[#FF6B2B]/15 font-mono">
              {student.full_name?.split(' ').map(n => n[0]).join('') || 'ST'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-[#FAF8F5]">{student.full_name}</h1>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-[#0F1A29] text-[#FF6B2B] font-bold border border-[#FF6B2B]/30">
                  {student.student_code}
                </span>
              </div>
              <p className="text-xs text-[#A89F8F] mt-1 font-mono">
                {student.course} • Year {student.year_of_study}
              </p>
            </div>
          </div>

          {/* Current Status Badge */}
          <div className={`px-4 py-2 rounded-2xl text-xs font-black font-mono flex items-center space-x-2 self-start sm:self-auto ${
            isInside
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isInside ? 'bg-emerald-400 animate-pulse' : 'bg-[#EF4444]'}`} />
            <span>STATUS: {student.current_status}</span>
          </div>
        </div>

        {/* Big Entry / Exit Action Controls */}
        <div className="py-6 border-b border-[#18283E]">
          <span className="text-xs font-bold uppercase text-[#A89F8F] font-mono tracking-wider block mb-3">
            Gate Movement Verification Controls
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* MARK ENTRY BUTTON */}
            <button
              onClick={handleMarkEntry}
              disabled={actionLoading}
              className={`py-4 px-6 rounded-2xl font-black text-sm transition flex items-center justify-center space-x-2.5 shadow-xl active:scale-[0.98] ${
                isInside
                  ? 'bg-[#142235] text-[#6B6355] border border-[#18283E] hover:text-[#A89F8F]'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25 ring-2 ring-emerald-400/50'
              }`}
            >
              <DoorOpen className="w-5 h-5" />
              <span>{actionLoading ? 'Recording...' : 'MARK ENTRY (CHECK IN)'}</span>
            </button>

            {/* MARK EXIT BUTTON */}
            <button
              onClick={handleMarkExit}
              disabled={actionLoading}
              className={`py-4 px-6 rounded-2xl font-black text-sm transition flex items-center justify-center space-x-2.5 shadow-xl active:scale-[0.98] ${
                !isInside
                  ? 'bg-[#142235] text-[#6B6355] border border-[#18283E] hover:text-[#A89F8F]'
                  : 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-rose-900/30 ring-2 ring-rose-400/50'
              }`}
            >
              <DoorClosed className="w-5 h-5" />
              <span>{actionLoading ? 'Recording...' : 'MARK EXIT (CHECK OUT)'}</span>
            </button>
          </div>
        </div>

        {/* Quarters & Standing Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
            <span className="text-[10px] uppercase font-bold text-[#A89F8F] font-mono tracking-wider block mb-1">
              Hostel Accommodation
            </span>
            <div className="text-base font-bold text-[#FAF8F5]">
              Room {student.room_number || 'Unassigned'}
            </div>
            <div className="text-xs text-[#A89F8F] mt-0.5 font-mono">
              {student.block_name || 'Block B'} • Bed {student.bed_number || 'B1'}
            </div>
          </div>

          <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
            <span className="text-[10px] uppercase font-bold text-[#A89F8F] font-mono tracking-wider block mb-1">
              Financial Standing
            </span>
            <div className="text-base font-bold text-[#FAF8F5] font-mono">
              ₹{student.outstanding_fee_amount || 0} Dues
            </div>
            <div className="text-xs text-[#A89F8F] mt-0.5 font-mono">
              {student.total_fines_amount ? `⚠️ ₹${student.total_fines_amount} Fines` : 'No unpaid fines'}
            </div>
          </div>

          <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
            <span className="text-[10px] uppercase font-bold text-[#A89F8F] font-mono tracking-wider block mb-1">
              Guardian Contact
            </span>
            <div className="text-base font-bold text-[#FAF8F5]">
              {student.guardian_name || 'Guardian'}
            </div>
            <div className="text-xs text-[#A89F8F] font-mono mt-0.5">
              {student.guardian_phone || 'Contact not on file'}
            </div>
          </div>
        </div>
      </div>

      {/* Movement Log Audit Trail */}
      <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold uppercase text-[#A89F8F] font-mono tracking-wider mb-4">
          Recent Gate Telemetry & Audit Logs
        </h3>

        {!student.recent_logs || student.recent_logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#A89F8F] font-mono">
            No gate movements recorded yet for this resident.
          </div>
        ) : (
          <div className="space-y-2">
            {student.recent_logs.map((log: any) => {
              const isEntry = log.action === 'ENTRY';
              return (
                <div
                  key={log.id}
                  className="bg-[#0F1A29] border border-[#18283E] p-3 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded font-black font-mono text-[10px] ${
                        isEntry ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
                      }`}
                    >
                      {log.action}
                    </span>
                    <span className="text-[#FAF8F5] font-semibold">{log.gate || 'MAIN_GATE_1'}</span>
                    <span className="text-[#A89F8F]">{log.remarks || 'Verification'}</span>
                  </div>

                  <span className="font-mono text-[#A89F8F]">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WardenStudentDetailPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[#A89F8F] font-mono text-xs">Loading student dossier...</div>}>
      <StudentDetailContent />
    </Suspense>
  );
}
