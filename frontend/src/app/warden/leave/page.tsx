'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LeaveRecord } from '@/lib/types';
import { CalendarClock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function WardenLeavePage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdate = async (leaveId: string, status: string) => {
    try {
      await api.leave.updateStatus(leaveId, status);
      fetchLeaves();
    } catch (err: any) {
      alert('Error updating leave: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Outstation & Gate Passes</h1>
          <p className="text-xs text-[#A89F8F] mt-0.5">Review and authorize resident overnight departures and leave permits</p>
        </div>

        <button
          onClick={fetchLeaves}
          title="Refresh leave registry"
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl text-[#C5BDB0] hover:text-[#FAF8F5] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading leave pass applications...</div>
      ) : leaves.length === 0 ? (
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-12 text-center text-[#A89F8F]">
          <CalendarClock className="w-8 h-8 text-[#A89F8F]/40 mx-auto mb-2" />
          <p className="font-semibold text-sm text-[#FAF8F5]">No Active Gate Passes</p>
          <p className="text-xs text-[#A89F8F] mt-1">There are no pending or active outstation pass requests in the registry.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((l) => (
            <div
              key={l.id}
              className="bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
                  <span className="text-xs font-mono font-bold text-[#FAF8F5] bg-[#142235] border border-[#223755] px-2.5 py-0.5 rounded-md">
                    {l.student_code}
                  </span>
                  <span className="text-sm font-bold text-[#FAF8F5]">{l.student_name}</span>
                  <span className="text-xs font-mono text-[#A89F8F] bg-[#0A121D] px-2 py-0.5 rounded border border-[#18283E]">
                    Room {l.room_number || 'B-204'}
                  </span>
                </div>
                <div className="text-xs text-[#F3EFE6]">
                  <span className="text-[#A89F8F] font-medium">Destination:</span> {l.destination}
                </div>
                <div className="text-xs text-[#C5BDB0] mt-0.5">
                  <span className="text-[#A89F8F] font-medium">Reason:</span> {l.reason}
                </div>
                <div className="text-[11px] font-mono text-[#A89F8F] mt-2.5 flex items-center gap-1.5">
                  <span className="text-[#64748B]">VALIDITY:</span>
                  <span className="text-[#FAF8F5]">{new Date(l.start_date).toLocaleDateString()}</span>
                  <span className="text-[#FF6B2B]">➔</span>
                  <span className="text-[#FAF8F5]">{new Date(l.end_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 self-start sm:self-center">
                {l.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleUpdate(l.id, 'APPROVED')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition active:scale-95 shadow-md shadow-emerald-500/20"
                    >
                      Approve Pass
                    </button>
                    <button
                      onClick={() => handleUpdate(l.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-[#142235] text-red-400 font-bold text-xs hover:bg-red-500/10 border border-red-500/30 transition active:scale-95"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-bold font-mono px-3.5 py-1 rounded-lg border ${
                    l.status === 'APPROVED' 
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}>
                    {l.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
