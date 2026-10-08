'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FeeRecord } from '@/lib/types';
import { CreditCard, RefreshCw, CheckCircle, Clock } from 'lucide-react';

export default function WardenFeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFees = async () => {
    try {
      const res = await api.fees.list();
      setFees(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const totalBilled = fees.reduce((acc, f) => acc + f.total_amount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paid_amount, 0);
  const totalOutstanding = totalBilled - totalCollected;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
            Financial Governance
          </span>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Fee Collections & Billing Ledger</h1>
          <p className="text-xs text-[#A89F8F]">Institutional hostel fee accounts, receivables, and arrears</p>
        </div>

        <button
          onClick={fetchFees}
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl text-[#C8C1B3] hover:text-[#FAF8F5] transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Aggregate Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 shadow-md">
          <span className="text-[10px] font-bold text-[#A89F8F] uppercase tracking-wider font-mono block mb-1">
            Total Billed
          </span>
          <span className="text-3xl font-black text-[#FAF8F5] font-tabular">
            ₹{totalBilled.toLocaleString()}
          </span>
        </div>

        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 shadow-md">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono block mb-1">
            Total Collected
          </span>
          <span className="text-3xl font-black text-emerald-400 font-tabular">
            ₹{totalCollected.toLocaleString()}
          </span>
        </div>

        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 shadow-md">
          <span className="text-[10px] font-bold text-[#EF4444] uppercase tracking-wider font-mono block mb-1">
            Total Outstanding Arrears
          </span>
          <span className="text-3xl font-black text-[#EF4444] font-tabular">
            ₹{totalOutstanding.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading fee records...</div>
      ) : (
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-[#18283E]">
            <h2 className="text-sm font-bold text-[#FAF8F5]">Resident Fee Roster</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0F1A29] text-[#A89F8F] font-mono font-bold uppercase border-b border-[#18283E]">
                <tr>
                  <th className="px-4 py-3">Resident</th>
                  <th className="px-4 py-3">Student Code</th>
                  <th className="px-4 py-3">Billed</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Remaining</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18283E]">
                {fees.map((f) => (
                  <tr key={f.id} className="hover:bg-[#0F1A29]/60 transition">
                    <td className="px-4 py-3 font-semibold text-[#FAF8F5]">{f.student_name}</td>
                    <td className="px-4 py-3 font-mono text-[#C8C1B3]">{f.student_code}</td>
                    <td className="px-4 py-3 text-[#FAF8F5] font-tabular">₹{f.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-emerald-400 font-tabular">₹{f.paid_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#EF4444] font-bold font-tabular">₹{f.remaining_balance.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        f.status === 'PAID'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
