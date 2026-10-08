'use client';

import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function WardenReportsPage() {
  const reports = [
    { title: 'Daily Hostel Movement Audit', desc: 'All gate check-ins, departures, and late entry citations', type: 'PDF' },
    { title: 'Residential Occupancy & Vacancy Census', desc: 'Bed allocation status across Block A and Block B', type: 'CSV' },
    { title: 'Outstanding Fee & Arrears Schedule', desc: 'Breakdown of pending hostel maintenance dues', type: 'Excel' },
    { title: 'Maintenance Ticket Turnaround Report', desc: 'Plumbing, Wi-Fi, and electrical ticket resolution metrics', type: 'PDF' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Administrative Reports & Export</h1>
        <p className="text-xs text-[#A89F8F] mt-0.5">Export certified university operations dossiers, turnstile movement logs, and compliance schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl p-5 flex flex-col justify-between transition-all shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#142235] text-[#FAF8F5] border border-[#223755] tracking-wider">
                  {r.type} FORMAT
                </span>
                <FileText className="w-4 h-4 text-[#A89F8F]" />
              </div>
              <h2 className="text-base font-bold text-[#FAF8F5] mb-1.5">{r.title}</h2>
              <p className="text-xs text-[#C5BDB0] mb-5">{r.desc}</p>
            </div>

            <button
              onClick={() => alert(`Exporting ${r.title}... Download generated.`)}
              className="w-full py-2.5 px-3 bg-[#142235] hover:bg-[#18283E] border border-[#18283E] hover:border-[#FF6B2B]/40 rounded-xl text-xs font-semibold text-[#FAF8F5] transition flex items-center justify-center space-x-2 active:scale-[0.99]"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B2B]" />
              <span>Download Official Report</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
