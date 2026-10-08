'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Users, Activity } from 'lucide-react';

export default function WardenAnalyticsPage() {
  const movementData = [
    { hour: '06 AM', entries: 12, exits: 45 },
    { hour: '09 AM', entries: 35, exits: 120 },
    { hour: '12 PM', entries: 80, exits: 60 },
    { hour: '03 PM', entries: 65, exits: 75 },
    { hour: '06 PM', entries: 140, exits: 50 },
    { hour: '09 PM', entries: 210, exits: 20 },
  ];

  const categoryData = [
    { name: 'Wi-Fi / Net', value: 35, color: '#FF6B2B' },
    { name: 'Electrical', value: 25, color: '#F59E0B' },
    { name: 'Plumbing', value: 20, color: '#38BDF8' },
    { name: 'Cleaning', value: 12, color: '#10B981' },
    { name: 'Others', value: 8, color: '#A89F8F' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Operations Analytics</h1>
        <p className="text-xs text-[#A89F8F] mt-0.5">Real-time gate traffic distribution, maintenance category breakdown, and operational telemetry</p>
      </div>

      {/* Analytics Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-4.5">
          <div className="flex items-center justify-between text-xs text-[#A89F8F]">
            <span>Daily Gate Throughput</span>
            <Activity className="w-4 h-4 text-[#FF6B2B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#FAF8F5] font-mono tracking-tight">847</span>
            <span className="text-xs font-semibold text-emerald-400 font-mono">+14.2%</span>
          </div>
          <p className="text-[11px] text-[#A89F8F] mt-1 font-mono">Total check-in & check-out scans</p>
        </div>

        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-4.5">
          <div className="flex items-center justify-between text-xs text-[#A89F8F]">
            <span>Peak Curfew Flow</span>
            <TrendingUp className="w-4 h-4 text-[#FF6B2B]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#FAF8F5] font-mono tracking-tight">09:00 PM</span>
            <span className="text-xs font-semibold text-[#FF6B2B] font-mono">230 evt/hr</span>
          </div>
          <p className="text-[11px] text-[#A89F8F] mt-1 font-mono">Max turnstile congestion window</p>
        </div>

        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-4.5">
          <div className="flex items-center justify-between text-xs text-[#A89F8F]">
            <span>Resolution Efficiency</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">91.4%</span>
            <span className="text-xs font-semibold text-[#A89F8F] font-mono">Avg 3.8h</span>
          </div>
          <p className="text-[11px] text-[#A89F8F] mt-1 font-mono">SLA compliance for facilities tickets</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movement Hourly Distribution */}
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#FAF8F5]">Gate Traffic Distribution</h2>
              <p className="text-xs text-[#A89F8F]">Peak hour load telemetry for biometric turnstiles</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF6B2B] bg-[#FF6B2B]/10 px-2.5 py-1 rounded-md border border-[#FF6B2B]/20">
              HOURLY
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movementData}>
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A121D', 
                    border: '1px solid #18283E', 
                    borderRadius: '8px',
                    color: '#FAF8F5',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="entries" name="Check Ins" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exits" name="Departures" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-mono text-[#A89F8F] mt-4 pt-4 border-t border-[#18283E]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Check Ins</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span>Departures</span>
            </div>
          </div>
        </div>

        {/* Complaints Breakdown */}
        <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[#FAF8F5]">Maintenance Breakdown</h2>
              <p className="text-xs text-[#A89F8F]">Distribution by facilities & utility category</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#FAF8F5] bg-[#142235] px-2.5 py-1 rounded-md border border-[#223755]">
              CATEGORIES
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#0F1A29"
                  strokeWidth={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0A121D', 
                    border: '1px solid #18283E', 
                    borderRadius: '8px',
                    color: '#FAF8F5',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#C5BDB0] mt-2 pt-4 border-t border-[#18283E]">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center space-x-1.5 font-mono">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span>{c.name} ({c.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
