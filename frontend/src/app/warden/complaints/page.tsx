'use client';

import React, { useEffect, useState } from 'react';
import { useSocketListener } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { Complaint } from '@/lib/types';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle, 
  ArrowRight, 
  UserCheck, 
  RefreshCw,
  X
} from 'lucide-react';

export default function WardenComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [staff, setStaff] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = async () => {
    try {
      const res = await api.complaints.list();
      setComplaints(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useSocketListener('COMPLAINT_CREATED', () => {
    fetchComplaints();
  });
  useSocketListener('COMPLAINT_UPDATED', () => {
    fetchComplaints();
  });

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      await api.complaints.updateStatus(selectedTicket.id, {
        status: newStatus,
        assigned_staff: staff || undefined,
        resolution_notes: notes || undefined,
      });
      setSelectedTicket(null);
      setStaff('');
      setNotes('');
      fetchComplaints();
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  // Group into Kanban columns
  const pendingList = complaints.filter((c) => ['SUBMITTED', 'ACKNOWLEDGED'].includes(c.status));
  const inProgressList = complaints.filter((c) => ['ASSIGNED', 'IN_PROGRESS'].includes(c.status));
  const resolvedList = complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status));

  const renderKanbanColumn = (title: string, count: number, items: Complaint[], badgeColor: string) => (
    <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[#18283E] mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#FAF8F5] font-mono">{title}</h2>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full font-mono ${badgeColor}`}>
          {count}
        </span>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh]">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6B6355] font-mono">No tickets in this column</div>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setSelectedTicket(c);
                setNewStatus(c.status === 'SUBMITTED' ? 'IN_PROGRESS' : 'RESOLVED');
                setStaff(c.assigned_staff || '');
                setNotes(c.resolution_notes || '');
              }}
              className="bg-[#0F1A29] hover:bg-[#142235] border border-[#18283E] hover:border-[#223755] rounded-xl p-4 cursor-pointer transition shadow-md group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#FF6B2B]">
                  {c.complaint_code}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                  c.priority === 'URGENT' ? 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30' : 'bg-[#142235] text-[#A89F8F]'
                }`}>
                  {c.priority}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#FAF8F5] mb-1 group-hover:text-[#FF6B2B] transition">
                {c.title}
              </h3>
              <p className="text-xs text-[#A89F8F] line-clamp-2 mb-3">{c.description}</p>

              <div className="text-[11px] text-[#A89F8F] space-y-0.5 pt-2 border-t border-[#18283E]">
                <div className="flex justify-between">
                  <span>Resident:</span>
                  <span className="text-[#FAF8F5] font-semibold">{c.student_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="text-[#FAF8F5] font-mono">{c.room_number || 'B-204'}</span>
                </div>
                {c.assigned_staff && (
                  <div className="flex justify-between text-amber-400 font-mono">
                    <span>Staff:</span>
                    <span>{c.assigned_staff}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
            Facilities Workflow
          </span>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Maintenance Operations Kanban</h1>
          <p className="text-xs text-[#A89F8F]">Manage hostel facility repairs, plumbing, electrical, and network tickets</p>
        </div>

        <button
          onClick={fetchComplaints}
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl text-[#C8C1B3] hover:text-[#FAF8F5] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading complaints Kanban...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderKanbanColumn('PENDING REVIEW', pendingList.length, pendingList, 'bg-[#142235] text-[#C8C1B3] border border-[#18283E]')}
          {renderKanbanColumn('IN PROGRESS', inProgressList.length, inProgressList, 'bg-[#FF6B2B]/15 text-[#FF6B2B] border border-[#FF6B2B]/30')}
          {renderKanbanColumn('RESOLVED', resolvedList.length, resolvedList, 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30')}
        </div>
      )}

      {/* Action / Status Update Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-[#F3EFE6]">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-[#A89F8F] hover:text-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-1">
              <span className="font-mono text-xs font-bold text-[#FF6B2B] bg-[#FF6B2B]/10 border border-[#FF6B2B]/20 px-2 py-0.5 rounded">
                {selectedTicket.complaint_code}
              </span>
              <span className="text-xs text-[#A89F8F]">{selectedTicket.category}</span>
            </div>

            <h2 className="text-lg font-bold text-[#FAF8F5] mb-2">{selectedTicket.title}</h2>
            <p className="text-xs text-[#C8C1B3] mb-4 bg-[#0F1A29] p-3 rounded-xl border border-[#18283E]">
              {selectedTicket.description}
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1 font-mono">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B] font-mono"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="ASSIGNED">Assigned Staff</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1 font-mono">Assigned Staff Member</label>
                <input
                  type="text"
                  value={staff}
                  onChange={(e) => setStaff(e.target.value)}
                  placeholder="e.g. Mr. Ramesh (Electrician)"
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1 font-mono">Resolution / Action Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Notes on repair or inspection..."
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3.5 py-2 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-[#FF6B2B]/20"
              >
                {updating ? 'Saving...' : 'Update Complaint Workflow'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
