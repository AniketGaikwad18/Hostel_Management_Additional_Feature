'use client';

import React, { useEffect, useState } from 'react';
import { useSocketListener } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { EmergencyAlertRecord } from '@/lib/types';
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw, MapPin } from 'lucide-react';

export default function WardenEmergencyPage() {
  const [alerts, setAlerts] = useState<EmergencyAlertRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const res = await api.emergency.list();
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  useSocketListener('EMERGENCY_TRIGGERED', (payload) => {
    fetchAlerts();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
            Mission-Critical Grid
          </span>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Emergency SOS Monitoring Station</h1>
          <p className="text-xs text-[#A89F8F]">High-priority resident distress signals, perimeter security alarms, and dispatch</p>
        </div>

        <button
          onClick={fetchAlerts}
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl text-[#C8C1B3] hover:text-[#FAF8F5] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Connecting to SOS alert grid...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-8 text-center text-[#A89F8F]">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-[#FAF8F5]">All Clear • No Active SOS Alerts</p>
          <p className="text-xs text-[#A89F8F] mt-1 font-mono">Hostel perimeter and resident quarters are secured.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((a) => (
            <div
              key={a.id}
              className="bg-[#140A0D] border-2 border-rose-500/60 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444] animate-ping" />
                  <span className="text-xs font-black uppercase text-[#EF4444] font-mono tracking-wider">
                    PRIORITY DISTRESS SIGNAL • ACTIVE
                  </span>
                </div>
                <span className="text-xs font-mono text-[#A89F8F]">
                  {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-[#FAF8F5]">
                    {a.student_name} <span className="font-mono text-[#FF6B2B]">({a.student_code})</span>
                  </h2>
                  <div className="flex items-center space-x-2 text-xs text-[#C8C1B3] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#EF4444]" />
                    <span>Location: <strong className="text-[#FAF8F5]">{a.location}</strong></span>
                    {a.room_number && <span>• Room: <strong className="text-[#FAF8F5] font-mono">{a.room_number}</strong></span>}
                  </div>
                  <p className="text-xs text-[#FAF8F5] mt-2 bg-[#060B12]/80 p-3 rounded-xl border border-rose-500/30 font-mono">
                    "{a.message}"
                  </p>
                </div>

                <div className="self-start sm:self-center">
                  <span className="px-4 py-2 rounded-xl bg-[#EF4444] text-white font-black text-xs font-mono inline-block shadow-lg shadow-rose-950/50">
                    URGENT DISPATCH
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
