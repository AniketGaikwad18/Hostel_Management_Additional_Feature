'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Building2, Users, Bed, DoorClosed } from 'lucide-react';

export default function StudentRoomPage() {
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await api.student.getRoom();
        setRoomData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadRoom();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading quarters dossier...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5]">Quarters & Roommates</h1>
        <p className="text-xs text-[#A89F8F]">Assigned block, floor, and roommate allocation roster</p>
      </div>

      <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#18283E]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#FF6B2B] font-mono tracking-wider">
              {roomData?.block} • Floor {roomData?.floor}
            </span>
            <h2 className="text-3xl font-black text-[#FAF8F5] mt-0.5 font-mono">
              Room {roomData?.room_number}
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#A89F8F] font-mono block">Occupancy</span>
            <span className="text-sm font-bold text-[#FAF8F5] font-mono">
              {roomData?.occupied_count} / {roomData?.capacity} Beds
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase text-[#A89F8F] tracking-wider mb-4 font-mono">
            Resident Roommates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roomData?.roommates?.map((r: any) => (
              <div
                key={r.student_id}
                className={`p-4 rounded-xl border transition ${
                  r.is_me
                    ? 'bg-[#0F1A29] border-[#FF6B2B]/60 text-[#FAF8F5]'
                    : 'bg-[#0F1A29] border-[#18283E] text-[#C8C1B3]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#060B12] text-[#FF6B2B] border border-[#18283E]">
                    Bed {r.bed}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    r.status === 'INSIDE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#FF6B2B] bg-[#FF6B2B]/10'
                  }`}>
                    {r.status}
                  </span>
                </div>

                <div className="font-bold text-sm text-[#FAF8F5]">
                  {r.name} {r.is_me && '(You)'}
                </div>
                <div className="text-xs text-[#A89F8F] font-mono mt-0.5">
                  {r.student_code}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
