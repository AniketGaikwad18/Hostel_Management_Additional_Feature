'use client';

import React, { useEffect, useState } from 'react';
import { useSocketListener } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { MovementLog } from '@/lib/types';
import { Activity, DoorClosed, DoorOpen, RefreshCw } from 'lucide-react';

export default function WardenLiveHostelPage() {
  const [logs, setLogs] = useState<MovementLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await api.movement.getLiveLogs();
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
  }, []);

  useSocketListener('MOVEMENT_UPDATE', (payload) => {
    const newEntry: MovementLog = {
      id: payload.log_id || String(Date.now()),
      student_id: payload.student_id,
      student_name: payload.student_name,
      student_code: payload.student_code,
      room_number: payload.room_number,
      action: payload.action,
      timestamp: payload.timestamp || new Date().toISOString(),
      gate: 'MAIN_GATE_1',
    };
    setLogs((prev) => [newEntry, ...prev]);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
              Operations Telemetry
            </span>
            <h1 className="text-2xl font-black text-[#FAF8F5]">Live Gate Telemetry</h1>
            <p className="text-xs text-[#A89F8F]">Continuous hostel perimeter movement stream and verification</p>
          </div>
        </div>

        <button
          onClick={fetchLive}
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl text-[#C8C1B3] hover:text-[#FAF8F5] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Connecting to telemetry hub...</div>
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => {
            const isEntry = log.action === 'ENTRY';
            return (
              <div
                key={log.id}
                className="bg-[#0A121D] border border-[#18283E] rounded-xl p-4 flex items-center justify-between hover:border-[#223755] transition shadow-md"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs font-mono ${
                      isEntry
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
                    }`}
                  >
                    {isEntry ? 'IN' : 'OUT'}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#FAF8F5]">{log.student_name}</span>
                      <span className="text-xs font-mono text-[#C8C1B3] bg-[#0F1A29] border border-[#18283E] px-2 py-0.5 rounded">
                        {log.room_number || 'Room'}
                      </span>
                    </div>
                    <div className="text-xs text-[#A89F8F] mt-0.5">
                      <span className="font-mono text-[#C8C1B3]">{log.student_code}</span> • Gate: {log.gate} • Verified by {log.warden_name || 'Terminal Reader'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold block font-mono ${
                      isEntry ? 'text-emerald-400' : 'text-[#EF4444]'
                    }`}
                  >
                    {isEntry ? '● CHECKED IN' : '● DEPARTED'}
                  </span>
                  <span className="text-[11px] font-mono text-[#A89F8F]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
