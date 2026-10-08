'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeaveRecord } from '@/lib/types';
import { Calendar, PlusCircle, Clock, X } from 'lucide-react';

export default function StudentLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [destination, setDestination] = useState('');
  const [reason, setReason] = useState('');

  const fetchLeaves = async () => {
    try {
      const res = await api.leave.list();
      setLeaves(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !destination || !reason) return;
    setSubmitting(true);
    try {
      await api.leave.apply({
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        destination,
        reason,
      });
      setShowModal(false);
      setDestination('');
      setReason('');
      fetchLeaves();
    } catch (err: any) {
      alert('Error applying for leave: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Outstation & Gate Passes</h1>
          <p className="text-xs text-[#A89F8F] mt-0.5">Apply for weekend outing authorization or overnight hostel departure</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FF6B2B] hover:bg-[#ea580c] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-[#FF6B2B]/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply Gate Pass</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading pass history...</div>
      ) : leaves.length === 0 ? (
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-12 text-center text-[#A89F8F]">
          <Calendar className="w-8 h-8 text-[#A89F8F]/40 mx-auto mb-2" />
          <p className="font-semibold text-sm text-[#FAF8F5]">No Active Passes</p>
          <p className="text-xs text-[#A89F8F] mt-1">You have no active or historical leave requests on file.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((l) => (
            <div key={l.id} className="bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl p-5 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#FAF8F5]">{l.destination}</span>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider border ${
                  l.status === 'APPROVED' 
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                    : l.status === 'REJECTED' 
                    ? 'bg-red-500/15 text-red-400 border-red-500/30' 
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}>
                  {l.status}
                </span>
              </div>
              <p className="text-xs text-[#C5BDB0] mb-3">{l.reason}</p>
              <div className="text-[11px] font-mono text-[#A89F8F] flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-[#FF6B2B]" />
                <span>
                  {new Date(l.start_date).toLocaleDateString()} ➔ {new Date(l.end_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setShowModal(false)} 
              className="absolute top-4 right-4 text-[#A89F8F] hover:text-[#FAF8F5] transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#FAF8F5] mb-1">Apply Outstation Gate Pass</h2>
            <p className="text-xs text-[#A89F8F] mb-5">Duty Warden will review and authorize your departure.</p>

            <form onSubmit={handleApply} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Destination Address</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Home, Pune, Maharashtra"
                  required
                  className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  placeholder="Reason for travel..."
                  required
                  className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF6B2B] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#FF6B2B]/20 transition"
              >
                {submitting ? 'Submitting Application...' : 'Submit Gate Pass Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
