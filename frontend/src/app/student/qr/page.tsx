'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/context/AuthContext';
import { useSocketListener } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { QrIdentityData } from '@/lib/types';
import { 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Check, 
  Building2, 
  Sparkles,
  QrCode as QrIcon,
  DoorClosed,
  Lock
} from 'lucide-react';

export default function StudentQrPage() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState<QrIdentityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchQr = async () => {
    try {
      const res = await api.qr.getMyQr();
      setQrData(res.data);
    } catch (err) {
      console.error('Failed to load student QR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQr();
  }, []);

  useSocketListener('MOVEMENT_UPDATE', (payload) => {
    if (payload.student_id === qrData?.student_id || payload.student_code === qrData?.student_code) {
      fetchQr();
    }
  });

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await api.qr.regenerate();
      setQrData(res.data);
    } catch (e: any) {
      alert('Failed to regenerate: ' + e.message);
    } finally {
      setRegenerating(false);
    }
  };

  const getDynamicScanUrl = () => {
    if (!qrData) return '';
    if (typeof window !== 'undefined') {
      // If student is on a mobile/LAN device, use current origin
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return `${window.location.origin}/scan?token=${encodeURIComponent(qrData.secure_token)}`;
      }
      // If student is on laptop (localhost), prefer NEXT_PUBLIC_APP_URL so external phones scan correctly
      if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') && !process.env.NEXT_PUBLIC_APP_URL.includes('127.0.0.1')) {
        return `${process.env.NEXT_PUBLIC_APP_URL}/scan?token=${encodeURIComponent(qrData.secure_token)}`;
      }
      return `${window.location.origin}/scan?token=${encodeURIComponent(qrData.secure_token)}`;
    }
    return qrData.scan_url;
  };

  const scanUrl = getDynamicScanUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <RefreshCw className="w-10 h-10 text-[#FF6B2B] animate-spin mx-auto mb-4" />
        <p className="text-xs font-mono text-[#A89F8F]">Synthesizing cryptographic identity token...</p>
      </div>
    );
  }

  const isInside = qrData?.current_status === 'INSIDE';

  return (
    <div className="max-w-md mx-auto py-2 px-1">
      {/* Identity Card Container */}
      <div className="bg-[#0A121D] border-2 border-[#18283E] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#18283E]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F1A29] border border-[#223755] flex items-center justify-center font-black text-[#FF6B2B] text-xl shadow-lg">
              H
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#FAF8F5] block">
                HOSTELSPHERE
              </span>
              <span className="text-[10px] text-[#A89F8F] font-mono tracking-wider font-semibold uppercase">
                DIGITAL IDENTITY PASS
              </span>
            </div>
          </div>

          {/* Current Status Pill */}
          <div className={`px-3 py-1 rounded-full text-xs font-black flex items-center space-x-1.5 font-mono ${
            isInside 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-[#FF6B2B]/15 text-[#FF6B2B] border border-[#FF6B2B]/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isInside ? 'bg-emerald-400 animate-pulse' : 'bg-[#FF6B2B]'}`} />
            <span>{qrData?.current_status || 'OUTSIDE'}</span>
          </div>
        </div>

        {/* Student Avatar & Basic Info */}
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-2xl bg-[#0F1A29] border-2 border-[#FF6B2B] mx-auto flex items-center justify-center text-[#FAF8F5] font-black text-2xl shadow-xl shadow-[#FF6B2B]/10 mb-3">
            {qrData?.student_name?.split(' ').map(n => n[0]).join('') || 'AG'}
          </div>
          
          <h2 className="text-2xl font-black text-[#FAF8F5] tracking-tight">
            {qrData?.student_name || 'Aniket Gaikwad'}
          </h2>
          
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#A89F8F] mt-1 font-mono">
            <span className="text-[#FF6B2B] bg-[#FF6B2B]/10 px-2 py-0.5 rounded border border-[#FF6B2B]/20">
              {qrData?.student_code || 'STU001'}
            </span>
            <span>•</span>
            <span>{qrData?.block_name || 'Block B'}</span>
            <span>•</span>
            <span className="text-[#FAF8F5] font-bold">Room {qrData?.room_number || 'B-204'}</span>
          </div>
        </div>

        {/* Large High-Contrast QR Code Display */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl shadow-2xl flex flex-col items-center justify-center mx-auto max-w-[270px] relative border-4 border-[#142235]">
          <QRCodeSVG
            value={scanUrl}
            size={220}
            level="H"
            includeMargin={false}
            fgColor="#060B12"
            bgColor="#FAF8F5"
          />

          <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-[#6B6355] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>CRYPTOGRAPHICALLY SEALED</span>
          </div>
        </div>

        {/* Security / Privacy Assurance */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#A89F8F] leading-relaxed max-w-xs mx-auto">
            Scan via smartphone on local network. Encodes secure token only; financial ledgers & private phone remain locked.
          </p>
        </div>

        {/* Token and Action Buttons */}
        <div className="mt-6 pt-5 border-t border-[#18283E] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#A89F8F] px-1 font-mono">
            <span>Security Hash:</span>
            <span className="text-[#FAF8F5]">
              {qrData?.secure_token?.slice(0, 16)}...
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="py-2.5 px-3 bg-[#0F1A29] hover:bg-[#142235] text-xs font-semibold text-[#FAF8F5] rounded-xl transition flex items-center justify-center space-x-1.5 border border-[#18283E]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Scan URL'}</span>
            </button>

            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="py-2.5 px-3 bg-[#0F1A29] hover:bg-[#142235] text-xs font-semibold text-[#FAF8F5] rounded-xl transition flex items-center justify-center space-x-1.5 border border-[#18283E]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
              <span>{regenerating ? 'Issuing...' : 'Refresh Token'}</span>
            </button>
          </div>

          {/* Quick Demo Scan Simulation Button */}
          <Link
            href={`/scan?token=${encodeURIComponent(qrData?.secure_token || '')}`}
            className="w-full py-3 bg-[#FF6B2B] hover:bg-[#EA580C] text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 shadow-lg shadow-[#FF6B2B]/20"
          >
            <span>Simulate Scan on Laptop</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
