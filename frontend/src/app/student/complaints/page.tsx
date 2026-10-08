'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Complaint } from '@/lib/types';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  RefreshCw,
  X
} from 'lucide-react';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Wi-Fi',
  'Cleaning',
  'Furniture',
  'Food',
  'Water',
  'Security',
  'Maintenance',
  'Other',
];

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wi-Fi');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');

  const fetchComplaints = async () => {
    try {
      const res = await api.student.getComplaints();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSubmitting(true);
    try {
      await api.complaints.create({
        title,
        description,
        category,
        priority,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      fetchComplaints();
    } catch (err: any) {
      alert('Failed to submit complaint: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
      case 'CLOSED':
        return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
      case 'IN_PROGRESS':
        return 'bg-[#FF6B2B]/15 text-[#FF6B2B] border border-[#FF6B2B]/30';
      case 'ASSIGNED':
      case 'ACKNOWLEDGED':
        return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
      default:
        return 'bg-[#142235] text-[#C8C1B3] border border-[#223755]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Maintenance & Facilities</h1>
          <p className="text-xs text-[#A89F8F]">Track repair requests and submit facility tickets</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 shadow-md shadow-[#FF6B2B]/20 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading maintenance tickets...</div>
      ) : complaints.length === 0 ? (
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-8 text-center text-[#A89F8F]">
          No active facility issues reported. Quarters are in good standing!
        </div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-[#0A121D] border border-[#18283E] rounded-xl p-5 hover:border-[#223755] transition shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-[#FF6B2B] bg-[#FF6B2B]/10 px-2 py-0.5 rounded border border-[#FF6B2B]/20">
                    {c.complaint_code}
                  </span>
                  <span className="text-xs text-[#A89F8F]">
                    Category: <strong className="text-[#FAF8F5]">{c.category}</strong>
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    c.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-[#142235] text-[#A89F8F]'
                  }`}>
                    {c.priority}
                  </span>
                </div>

                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full font-mono self-start ${getStatusBadge(c.status)}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#FAF8F5] mb-1">{c.title}</h3>
              <p className="text-xs text-[#C8C1B3] leading-relaxed mb-3">{c.description}</p>

              {c.assigned_staff && (
                <div className="text-xs bg-[#0F1A29] p-2.5 rounded-lg border border-[#18283E] text-[#C8C1B3] mb-2 font-mono">
                  <span className="text-[#A89F8F] font-semibold">Assigned Staff:</span> {c.assigned_staff}
                  {c.resolution_notes && (
                    <div className="mt-1 text-[#A89F8F] text-[11px]">
                      <span className="text-[#FF6B2B]">Note:</span> {c.resolution_notes}
                    </div>
                  )}
                </div>
              )}

              <div className="text-[10px] text-[#A89F8F] font-mono">
                Filed: {new Date(c.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#A89F8F] hover:text-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#FAF8F5] mb-1">Submit Maintenance Ticket</h2>
            <p className="text-xs text-[#A89F8F] mb-5">
              Hostel facilities staff will be dispatched to resolve your room issue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1">Issue Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Washroom sink tap valve leaking"
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#C8C1B3] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3 py-2.5 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#C8C1B3] mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3 py-2.5 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (Immediate)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1">Description & Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Describe location details in room..."
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-[#FF6B2B]/20"
              >
                {submitting ? 'Registering...' : 'Dispatch Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
