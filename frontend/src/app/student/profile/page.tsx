'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StudentProfile } from '@/lib/types';
import { User, Phone, Mail, Building2, Shield, LogOut } from 'lucide-react';

export default function StudentProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.student.getMe();
        setProfile(res.data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-[#FAF8F5] tracking-tight">Resident Profile</h1>
        <p className="text-xs text-[#A89F8F] mt-0.5">Institutional record, student identification, and emergency guardian contacts</p>
      </div>

      <div className="bg-[#0F1A29] border border-[#18283E] rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center space-x-4 pb-6 border-b border-[#18283E]">
          <div className="w-16 h-16 rounded-2xl bg-[#142235] border-2 border-[#FF6B2B] flex items-center justify-center text-[#FAF8F5] font-black text-xl font-mono shadow-md shadow-[#FF6B2B]/10">
            {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'AG'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#FAF8F5]">{profile?.full_name || 'Aniket Gaikwad'}</h2>
            <div className="text-xs text-[#FF6B2B] font-mono mt-0.5">
              {profile?.student_code || 'STU001'} • Year {profile?.year_of_study || 3}
            </div>
            <div className="text-xs text-[#A89F8F] mt-0.5">
              {profile?.course || 'B.Tech Computer Science'}
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-[#18283E]">
            <span className="text-[#A89F8F]">University Email:</span>
            <span className="text-[#FAF8F5] font-mono">{profile?.email || 'aniket.gaikwad@hostelsphere.edu'}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-[#18283E]">
            <span className="text-[#A89F8F]">Personal Phone:</span>
            <span className="text-[#FAF8F5] font-mono">{profile?.phone || '+91 91234 56789'}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-[#18283E]">
            <span className="text-[#A89F8F]">Assigned Quarters:</span>
            <span className="text-[#FAF8F5] font-semibold">{profile?.block_name} • Room {profile?.room_number}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-[#18283E]">
            <span className="text-[#A89F8F]">Guardian Name:</span>
            <span className="text-[#FAF8F5] font-semibold">{profile?.guardian_name || 'Sanjay Gaikwad'}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-[#A89F8F]">Guardian Emergency Contact:</span>
            <span className="text-[#FAF8F5] font-mono">{profile?.guardian_phone || '+91 98220 12345'}</span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full bg-[#142235] hover:bg-red-500/10 text-red-400 hover:border-red-500/30 border border-[#18283E] font-bold py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 text-xs active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Resident Session</span>
        </button>
      </div>
    </div>
  );
}
