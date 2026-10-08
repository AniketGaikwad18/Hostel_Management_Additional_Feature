'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MovementLog } from '@/lib/types';
import { Clock, DoorClosed, ShieldCheck, RefreshCw, Calendar } from 'lucide-react';

export default function StudentActivityPage() {
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.student.getActivity();
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Movement Telemetry</h1>
          <p className="text-xs text-[#A89F8F]">Chronological hostel perimeter gate records</p>
        </div>
        <button
          onClick={fetchLogs}
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] rounded-xl text-[#C8C1B3] hover:text-[#FAF8F5]"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading activity stream...</div>
      ) : logs.length === 0 ? (
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-8 text-center text-[#A89F8F]">
          No perimeter gate movement recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isEntry = log.action === 'ENTRY';
            return (
              <div
                key={log.id}
                className="bg-[#0A121D] border border-[#18283E] rounded-xl p-4 flex items-center justify-between hover:border-[#223755] transition"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                      isEntry
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#FF6B2B]/15 text-[#FF6B2B] border border-[#FF6B2B]/30'
                    }`}
                  >
                    {isEntry ? 'IN' : 'OUT'}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-[#FAF8F5] flex items-center space-x-2">
                      <span>{isEntry ? 'Hostel Check-In' : 'Campus Departure'}</span>
                      <span className="text-[10px] font-mono text-[#A89F8F] bg-[#0F1A29] px-2 py-0.5 rounded border border-[#18283E]">
                        {log.gate}
                      </span>
                    </div>
                    <div className="text-xs text-[#A89F8F] mt-0.5">
                      {log.remarks || 'Routine perimeter movement verification'}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-xs text-[#FAF8F5] font-semibold">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] text-[#A89F8F]">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
