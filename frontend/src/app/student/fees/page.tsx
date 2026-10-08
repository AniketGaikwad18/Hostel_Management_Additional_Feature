'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FeeRecord } from '@/lib/types';
import { CreditCard, ExternalLink, CheckCircle, Clock, Receipt, RefreshCw } from 'lucide-react';

export default function StudentFeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFees = async () => {
    try {
      const res = await api.student.getFees();
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

  if (loading) {
    return <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading fees ledger...</div>;
  }

  const primaryFee = fees[0];
  const paymentUrl = primaryFee?.payment_url || 'https://payments.hostelsphere.university.edu';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5]">Hostel Fees & Billing</h1>
        <p className="text-xs text-[#A89F8F]">Academic semester residential dues and payment receipts</p>
      </div>

      {primaryFee && (
        <div className="bg-[#0A121D] border-2 border-[#18283E] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#18283E]">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#FF6B2B] font-mono tracking-wider">
                {primaryFee.academic_year} • {primaryFee.semester}
              </span>
              <h2 className="text-xl font-black text-[#FAF8F5] mt-0.5">
                Hostel Accommodation & Facilities Dues
              </h2>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-mono font-black self-start sm:self-auto ${
              primaryFee.status === 'PAID'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
            }`}>
              {primaryFee.status}
            </div>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
              <span className="text-[10px] uppercase text-[#A89F8F] font-bold tracking-wider font-mono block mb-1">
                Total Billed
              </span>
              <span className="text-2xl font-black text-[#FAF8F5] font-mono">
                ₹{primaryFee.total_amount.toLocaleString()}
              </span>
            </div>

            <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
              <span className="text-[10px] uppercase text-[#A89F8F] font-bold tracking-wider font-mono block mb-1">
                Settled Amount
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                ₹{primaryFee.paid_amount.toLocaleString()}
              </span>
            </div>

            <div className="bg-[#0F1A29] p-4 rounded-xl border border-[#18283E]">
              <span className="text-[10px] uppercase text-[#A89F8F] font-bold tracking-wider font-mono block mb-1">
                Outstanding Balance
              </span>
              <span className={`text-2xl font-black font-mono ${primaryFee.remaining_balance > 0 ? 'text-[#FF6B2B]' : 'text-[#C8C1B3]'}`}>
                ₹{primaryFee.remaining_balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          {primaryFee.remaining_balance > 0 ? (
            <div className="pt-2">
              <a
                href={paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-[#FF6B2B]/20"
              >
                <span>PAY UNIVERSITY RESIDENTIAL FEES</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-center text-[#A89F8F] mt-2 font-mono">
                Due Date: {new Date(primaryFee.due_date).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-center text-xs font-semibold flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>All residential dues for this term are completely settled.</span>
            </div>
          )}

          {/* Payment Receipts */}
          {primaryFee.payments && primaryFee.payments.length > 0 && (
            <div className="pt-4 border-t border-[#18283E]">
              <h3 className="text-xs font-bold uppercase text-[#A89F8F] tracking-wider mb-3 font-mono">
                Transaction History & Receipts
              </h3>
              <div className="space-y-2">
                {primaryFee.payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#0F1A29] border border-[#18283E] p-3 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[#FAF8F5] block font-mono">₹{p.amount.toLocaleString()}</span>
                      <span className="text-[10px] font-mono text-[#A89F8F]">{p.transaction_ref} • {p.payment_method}</span>
                    </div>
                    <span className="text-[11px] text-[#A89F8F] font-mono">
                      {new Date(p.paid_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
