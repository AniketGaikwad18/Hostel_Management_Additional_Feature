'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FineRecord } from '@/lib/types';
import { AlertCircle, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

export default function StudentFinesPage() {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = async () => {
    try {
      const res = await api.student.getFines();
      setFines(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5]">Disciplinary Citations</h1>
        <p className="text-xs text-[#A89F8F]">Institutional hostel policy violations and standing</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading citation records...</div>
      ) : fines.length === 0 ? (
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-8 text-center text-[#A89F8F]">
          <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-bold text-[#FAF8F5]">Pristine Conduct Record</p>
          <p className="text-xs text-[#A89F8F] mt-1">No infractions or late entry penalties on file.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {fines.map((f) => (
            <div
              key={f.id}
              className="bg-[#0A121D] border border-[#18283E] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#FF6B2B] bg-[#FF6B2B]/15 px-2 py-0.5 rounded border border-[#FF6B2B]/30 font-mono">
                    {f.category}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    f.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {f.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#FAF8F5]">{f.reason}</h3>
                <p className="text-[11px] text-[#A89F8F] font-mono">
                  Issued by {f.issued_by_warden || 'Chief Warden'} on {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right self-start sm:self-center">
                <span className="text-2xl font-black text-[#FF6B2B] font-mono">
                  ₹{f.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
