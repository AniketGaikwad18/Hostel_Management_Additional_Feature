'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AnnouncementRecord } from '@/lib/types';
import { Megaphone } from 'lucide-react';

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.announcements.list();
        setItems(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Hostel Notice Board</h1>
        <p className="text-xs text-[#A89F8F] mt-0.5">Institutional circulars and Chief Warden operational bulletins</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading notices...</div>
      ) : items.length === 0 ? (
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-12 text-center text-[#A89F8F]">
          <Megaphone className="w-8 h-8 text-[#A89F8F]/40 mx-auto mb-2" />
          <p className="font-semibold text-sm text-[#FAF8F5]">No Active Bulletins</p>
          <p className="text-xs text-[#A89F8F] mt-1">There are no operational notices published at this moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((ann) => {
            const isCritical = ann.priority === 'CRITICAL';
            return (
              <div
                key={ann.id}
                className={`p-5 rounded-xl border transition-all shadow-sm ${
                  isCritical
                    ? 'bg-red-500/[0.06] border-red-500/30'
                    : 'bg-[#0F1A29] border-[#18283E] hover:border-[#223755]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider border ${
                    isCritical
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-[#142235] text-[#FF6B2B] border border-[#FF6B2B]/20'
                  }`}>
                    {ann.priority}
                  </span>
                  <span className="text-[11px] font-mono text-[#A89F8F]">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-base font-bold text-[#FAF8F5] mb-1.5">{ann.title}</h2>
                <p className="text-xs text-[#C5BDB0] leading-relaxed mb-3 whitespace-pre-line">{ann.content}</p>

                <div className="text-[11px] text-[#A89F8F] font-mono">
                  Issued by: <span className="text-[#FAF8F5]">{ann.warden_name || 'Chief Warden Office'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
