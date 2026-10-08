'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FineRecord, StudentProfile } from '@/lib/types';
import { AlertTriangle, PlusCircle, CheckCircle, RefreshCw, X } from 'lucide-react';

const FINE_CATEGORIES = ['Late Entry', 'Rule Violation', 'Property Damage', 'Other'];

export default function WardenFinesPage() {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [category, setCategory] = useState('Late Entry');
  const [amount, setAmount] = useState('250');
  const [reason, setReason] = useState('');

  const fetchFines = async () => {
    try {
      const res = await api.fines.list();
      setFines(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.warden.getStudents();
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFines();
    fetchStudents();
  }, []);

  const handleIssueFine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !amount || !reason) return;
    setSubmitting(true);
    try {
      await api.fines.create({
        student_id: studentId,
        category,
        amount: parseFloat(amount),
        reason,
      });
      setShowModal(false);
      setStudentId('');
      setReason('');
      fetchFines();
    } catch (err: any) {
      alert('Error issuing fine: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (fineId: string, status: string) => {
    try {
      await api.fines.updateStatus(fineId, status);
      fetchFines();
    } catch (err: any) {
      alert('Error updating fine: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Disciplinary Citations & Fines</h1>
          <p className="text-xs text-[#A89F8F] mt-0.5">Institutional policy violations, curfew breach citations, and penalty administration</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FF6B2B] hover:bg-[#ea580c] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-[#FF6B2B]/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue Fine Citation</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading fine ledger...</div>
      ) : fines.length === 0 ? (
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-12 text-center text-[#A89F8F]">
          <p className="font-semibold text-sm text-[#FAF8F5]">No Disciplinary Citations</p>
          <p className="text-xs text-[#A89F8F] mt-1">All residents are currently in good standing with zero recorded fines.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((f) => (
            <div
              key={f.id}
              className="bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                  <span className="text-xs font-mono font-bold text-[#FAF8F5] bg-[#142235] border border-[#223755] px-2.5 py-0.5 rounded-md">
                    {f.student_code}
                  </span>
                  <span className="text-sm font-bold text-[#FAF8F5]">{f.student_name}</span>
                  <span className="text-xs font-bold text-[#FF6B2B] bg-[#FF6B2B]/10 border border-[#FF6B2B]/20 px-2 py-0.5 rounded-md">
                    {f.category}
                  </span>
                </div>
                <p className="text-xs text-[#C5BDB0]">{f.reason}</p>
                <span className="text-[10px] text-[#A89F8F] font-mono mt-1.5 block">
                  Issued on {new Date(f.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center space-x-4 self-start sm:self-center">
                <span className="text-2xl font-black text-[#FF6B2B] font-mono tracking-tight">
                  ₹{f.amount}
                </span>

                <div className="flex items-center space-x-2">
                  {f.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'PAID')}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition active:scale-95"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(f.id, 'WAIVED')}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg bg-[#142235] text-[#C5BDB0] border border-[#18283E] hover:bg-[#18283E] hover:text-[#FAF8F5] transition active:scale-95"
                      >
                        Waive
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                      f.status === 'PAID' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                        : 'bg-[#142235] text-[#A89F8F] border-[#18283E]'
                    }`}>
                      {f.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#A89F8F] hover:text-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#FAF8F5] mb-1">Issue Disciplinary Fine</h2>
            <p className="text-xs text-[#A89F8F] mb-5">
              Record citation against student profile and synchronize with ledger.
            </p>

            <form onSubmit={handleIssueFine} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">
                  Select Student
                </label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                >
                  <option value="" className="bg-[#0A121D]">Choose resident student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0A121D]">
                      {s.full_name} ({s.student_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  >
                    {FINE_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0A121D]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">
                  Reason for Citation
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  required
                  placeholder="e.g. Reported after 10:00 PM curfew without gate pass"
                  className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || !studentId}
                className="w-full bg-[#FF6B2B] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#FF6B2B]/20 transition"
              >
                {submitting ? 'Issuing Citation...' : 'Issue Disciplinary Fine'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
