'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { RoomRecord, StudentProfile } from '@/lib/types';
import { Building2, Users, Bed, Check, X, PlusCircle, RefreshCw } from 'lucide-react';

export default function WardenRoomsPage() {
  const [rooms, setRooms] = useState<RoomRecord[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState('Block B');
  const [allocatingRoom, setAllocatingRoom] = useState<RoomRecord | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    try {
      const res = await api.rooms.list({ block_name: selectedBlock });
      setRooms(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.warden.getStudents();
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchStudents();
  }, [selectedBlock]);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocatingRoom || !selectedStudentId) return;
    setSubmitting(true);
    try {
      await api.rooms.allocate(allocatingRoom.id, selectedStudentId, selectedBedId || undefined);
      setAllocatingRoom(null);
      setSelectedStudentId('');
      setSelectedBedId('');
      fetchRooms();
    } catch (err: any) {
      alert('Allocation error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacate = async (roomId: string, studentId: string) => {
    if (!confirm('Vacate this student from the room?')) return;
    try {
      await api.rooms.vacate(roomId, studentId);
      fetchRooms();
    } catch (err: any) {
      alert('Vacate error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
            Facility Inventory
          </span>
          <h1 className="text-2xl font-black text-[#FAF8F5]">Quarters & Room Allocation</h1>
          <p className="text-xs text-[#A89F8F]">Hostel room inventory, bed management, and resident assignments</p>
        </div>

        {/* Block Switcher */}
        <div className="flex items-center space-x-2">
          {['Block A', 'Block B'].map((block) => (
            <button
              key={block}
              onClick={() => setSelectedBlock(block)}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition ${
                selectedBlock === block
                  ? 'bg-[#FF6B2B] text-white shadow-md shadow-[#FF6B2B]/20'
                  : 'bg-[#0F1A29] text-[#A89F8F] hover:text-[#FAF8F5] border border-[#18283E] hover:border-[#223755]'
              }`}
            >
              {block}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-[#A89F8F] font-mono text-xs">Loading room inventory...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => {
            const isFull = room.occupied_count >= room.capacity;
            return (
              <div
                key={room.id}
                className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-5 flex flex-col justify-between shadow-lg hover:border-[#223755] transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-black text-[#FAF8F5] font-mono">{room.room_number}</span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono ${
                        isFull
                          ? 'bg-rose-500/15 text-[#EF4444] border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {room.occupied_count} / {room.capacity} OCCUPIED
                    </span>
                  </div>

                  <div className="text-xs text-[#A89F8F] mb-4">
                    Floor {room.floor_number} • Status: <strong className="text-[#FAF8F5] font-mono">{room.status}</strong>
                  </div>

                  {/* Beds Overview */}
                  <div className="space-y-1.5 mb-4">
                    {room.beds.map((b) => (
                      <div
                        key={b.id}
                        className="bg-[#0F1A29] p-2.5 rounded-xl border border-[#18283E] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[10px] text-[#FF6B2B] font-bold bg-[#060B12] px-1.5 py-0.5 rounded border border-[#18283E]">
                            {b.bed_number}
                          </span>
                          <span className={b.is_occupied ? 'text-[#FAF8F5] font-semibold' : 'text-[#6B6355]'}>
                            {b.is_occupied ? b.student_name : 'Available Bed'}
                          </span>
                        </div>

                        {b.is_occupied && b.student_id && (
                          <button
                            onClick={() => handleVacate(room.id, b.student_id!)}
                            className="text-[10px] text-[#EF4444] hover:underline font-bold font-mono"
                          >
                            Vacate
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {!isFull && (
                  <button
                    onClick={() => setAllocatingRoom(room)}
                    className="w-full bg-[#0F1A29] hover:bg-[#142235] text-[#FF6B2B] border border-[#FF6B2B]/30 hover:border-[#FF6B2B] font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-1.5 mt-2"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Allocate Resident</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Allocation Modal */}
      {allocatingRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-[#F3EFE6]">
            <button
              onClick={() => setAllocatingRoom(null)}
              className="absolute top-4 right-4 text-[#A89F8F] hover:text-[#FAF8F5]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#FAF8F5] mb-1">
              Allocate Room {allocatingRoom.room_number}
            </h2>
            <p className="text-xs text-[#A89F8F] mb-5">
              Select an enrolled student to assign to this room.
            </p>

            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1 font-mono">
                  Select Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  required
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B] font-mono"
                >
                  <option value="">Choose resident student...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.student_code}) - Current: {s.room_number || 'Unassigned'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#C8C1B3] mb-1 font-mono">
                  Select Bed (Optional)
                </label>
                <select
                  value={selectedBedId}
                  onChange={(e) => setSelectedBedId(e.target.value)}
                  className="w-full bg-[#0F1A29] border border-[#18283E] rounded-xl px-3.5 py-2.5 text-xs text-[#FAF8F5] focus:outline-none focus:border-[#FF6B2B] font-mono"
                >
                  <option value="">First Available Bed</option>
                  {allocatingRoom.beds
                    .filter((b) => !b.is_occupied)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bed_number} (Free)
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedStudentId}
                className="w-full bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-[#FF6B2B]/20"
              >
                {submitting ? 'Allocating...' : 'Confirm Room Allocation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
