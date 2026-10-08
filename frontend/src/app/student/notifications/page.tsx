'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export default function StudentNotificationsPage() {
  const notifications = [
    { id: '1', title: 'Wi-Fi Ticket Assigned', message: 'Your complaint CMP-1001 has been assigned to Mr. Suresh.', type: 'INFO', time: '1 hour ago' },
    { id: '2', title: 'Curfew Reminder', message: 'All students must mark entry before 10:00 PM tonight.', type: 'WARNING', time: '3 hours ago' },
    { id: '3', title: 'Upcoming Fee Balance', message: 'Semester 5 pending balance of ₹10,000 due soon.', type: 'WARNING', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Notifications</h1>
        <p className="text-xs text-[#A89F8F] mt-0.5">Institutional circulars and gate movement alerts</p>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-[#0F1A29] border border-[#18283E] hover:border-[#223755] rounded-xl p-4 flex items-start space-x-3.5 transition-all shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-[#142235] text-[#FF6B2B] border border-[#18283E] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <h2 className="text-sm font-bold text-[#FAF8F5]">{n.title}</h2>
                <span className="text-[10px] font-mono text-[#A89F8F]">{n.time}</span>
              </div>
              <p className="text-xs text-[#C5BDB0] leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
