'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AnnouncementRecord } from '@/lib/types';
import { Megaphone, PlusCircle, RefreshCw, X } from 'lucide-react';

export default function WardenAnnouncementsPage() {
  const [items, setItems] = useState<AnnouncementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [target, setTarget] = useState('ALL');

  const fetchAnnouncements = async () => {
    try {
      const res = await api.announcements.list();
      setItems(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      await api.announcements.create({
        title,
        content,
        priority,
        target_audience: target,
      });
      setShowModal(false);
      setTitle('');
      setContent('');
      fetchAnnouncements();
    } catch (err: any) {
      alert('Error broadcasting announcement: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Broadcast Announcements</h1>
          <p className="text-xs text-[#A89F8F] mt-0.5">Post institutional bulletins and operational circulars to resident portals</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FF6B2B] hover:bg-[#ea580c] text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-lg shadow-[#FF6B2B]/20 transition-all active:scale-[0.98]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Bulletin Notice</span>
        </button>
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
            const isImportant = ann.priority === 'IMPORTANT';
            return (
              <div
                key={ann.id}
                className={`p-5 rounded-xl border transition-all shadow-sm ${
                  isCritical
                    ? 'bg-red-500/[0.06] border-red-500/30'
                    : isImportant
                    ? 'bg-[#0F1A29] border-[#FF6B2B]/30 hover:border-[#FF6B2B]/50'
                    : 'bg-[#0F1A29] border-[#18283E] hover:border-[#223755]'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider border ${
                    isCritical
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : isImportant
                      ? 'bg-[#FF6B2B]/15 text-[#FF6B2B] border-[#FF6B2B]/30'
                      : 'bg-[#142235] text-[#FAF8F5] border-[#223755]'
                  }`}>
                    {ann.priority} • AUDIENCE: {ann.target_audience}
                  </span>
                  <span className="text-[11px] font-mono text-[#A89F8F]">
                    {new Date(ann.created_at).toLocaleString()}
                  </span>
                </div>
                <h2 className="text-base font-bold text-[#FAF8F5] mb-1.5">{ann.title}</h2>
                <p className="text-xs text-[#C5BDB0] leading-relaxed whitespace-pre-line">{ann.content}</p>
              </div>
            );
          })}
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
            <h2 className="text-xl font-bold text-[#FAF8F5] mb-1">Broadcast Official Circular</h2>
            <p className="text-xs text-[#A89F8F] mb-5">Circular will dispatch instantly to resident portals.</p>

            <form onSubmit={handlePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Mandatory Hostel Floor Meeting"
                  required
                  className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  >
                    <option value="NORMAL" className="bg-[#0A121D]">Normal</option>
                    <option value="IMPORTANT" className="bg-[#0A121D]">Important</option>
                    <option value="CRITICAL" className="bg-[#0A121D]">Critical (Alert)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Target Audience</label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  >
                    <option value="ALL" className="bg-[#0A121D]">All Residents</option>
                    <option value="BLOCK_A" className="bg-[#0A121D]">Block A Only</option>
                    <option value="BLOCK_B" className="bg-[#0A121D]">Block B Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C5BDB0] mb-1">Circular Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  placeholder="Official notice details and instructions..."
                  required
                  className="w-full bg-[#142235] border border-[#18283E] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF6B2B] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-[#FF6B2B]/20 transition"
              >
                {submitting ? 'Publishing Bulletin...' : 'Broadcast Bulletin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
