'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StudentProfile } from '@/lib/types';
import { Search, Filter, ArrowRight, DoorClosed, RefreshCw } from 'lucide-react';

export default function WardenStudentsPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchStudents = async () => {
    try {
      const res = await api.warden.getStudents({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
            Residential Registry
          </span>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Resident Students Roster</h1>
          <p className="text-xs text-[#A89F8F]">All registered university hostel occupants and room allocations</p>
        </div>

        <button
          onClick={fetchStudents}
          className="p-2.5 bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl text-[#C8C1B3] hover:text-[#FAF8F5] transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#6B6355] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID (e.g. STU001), or room..."
            className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#FAF8F5] placeholder-[#6B6355] focus:outline-none focus:border-[#FF6B2B] transition font-mono"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0F1A29] border border-[#18283E] rounded-xl px-3 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B] transition font-mono"
        >
          <option value="">All Statuses</option>
          <option value="INSIDE">Inside Campus</option>
          <option value="OUTSIDE">Outside Campus</option>
        </select>
      </div>

      {/* Student Cards List */}
      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading student directory...</div>
      ) : students.length === 0 ? (
        <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-8 text-center text-[#A89F8F]">
          No students matched your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s) => {
            const isInside = s.current_status === 'INSIDE';
            return (
              <div
                key={s.id}
                className="bg-[#0A121D] border border-[#18283E] hover:border-[#FF6B2B]/40 rounded-2xl p-5 flex flex-col justify-between transition group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-[#FF6B2B] bg-[#FF6B2B]/10 border border-[#FF6B2B]/20 px-2 py-0.5 rounded">
                      {s.student_code}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isInside ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
                      }`}
                    >
                      {s.current_status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#FAF8F5] group-hover:text-[#FF6B2B] transition">
                    {s.full_name}
                  </h3>
                  <p className="text-xs text-[#A89F8F] mt-0.5">{s.course}</p>

                  <div className="mt-3 pt-3 border-t border-[#18283E] text-xs text-[#A89F8F] space-y-1">
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span className="text-[#FAF8F5] font-semibold">{s.block_name} • {s.room_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bed:</span>
                      <span className="text-[#C8C1B3] font-mono">{s.bed_number}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/warden/students/${s.id}`}
                  className="mt-4 pt-3 border-t border-[#18283E] flex items-center justify-between text-xs text-[#FF6B2B] font-bold hover:underline font-mono"
                >
                  <span>Verify / Gate Action</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
