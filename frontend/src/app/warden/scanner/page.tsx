'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Camera, 
  Keyboard, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  QrCode as QrIcon
} from 'lucide-react';

export default function WardenScannerPage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  // Initialize camera scanner if available
  useEffect(() => {
    isComponentMounted.current = true;

    async function initCamera() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isComponentMounted.current) return;

        const html5QrCode = new Html5Qrcode('qr-reader');
        scannerRef.current = html5QrCode;

        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const cameraId = cameras[0].id;
          await html5QrCode.start(
            cameraId,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              handleQrDetected(decodedText);
            },
            () => {
              // Ignore frame errors
            }
          );
          setScanning(true);
        } else {
          setCameraError('No video cameras detected on this device. Manual token entry ready below.');
        }
      } catch (e: any) {
        setCameraError(
          'Camera access not available or permission denied. Please use manual token entry below.'
        );
      }
    }

    initCamera();

    return () => {
      isComponentMounted.current = false;
      if (scannerRef.current) {
        try {
          scannerRef.current.stop().then(() => scannerRef.current.clear());
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  const handleQrDetected = async (rawUrlOrToken: string) => {
    let resolvedToken = rawUrlOrToken.trim();
    // If it's a full URL e.g. http://192.168.1.5:3000/scan?token=abc123
    if (resolvedToken.includes('token=')) {
      try {
        const url = new URL(resolvedToken);
        resolvedToken = url.searchParams.get('token') || resolvedToken;
      } catch (e) {
        const parts = resolvedToken.split('token=');
        if (parts[1]) resolvedToken = parts[1].split('&')[0];
      }
    }

    resolveToken(resolvedToken);
  };

  const resolveToken = async (targetToken: string) => {
    if (!targetToken) {
      setError('Please provide a student QR token');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.qr.scanWarden(targetToken);
      if (res.data?.student_id) {
        // Redirect directly to student verification screen
        router.push(`/warden/students/${res.data.student_id}?source=qr`);
      } else {
        throw new Error('Unable to resolve student record');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or unrecognized QR identity');
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleQrDetected(tokenInput);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <span className="text-xs uppercase font-mono font-bold text-[#FF6B2B] tracking-wider block mb-0.5">
          Perimeter Security Telemetry
        </span>
        <h1 className="text-2xl font-black text-[#FAF8F5]">Gate Terminal QR Scanner</h1>
        <p className="text-xs text-[#A89F8F]">
          Point optical sensor at student digital pass or utilize instant cryptographic token verification
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Camera Scanning Viewport Frame */}
      <div className="bg-[#0A121D] border-2 border-[#18283E] rounded-2xl p-6 shadow-2xl overflow-hidden relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-4 h-4 text-[#FF6B2B]" />
            <span className="text-xs font-bold text-[#FAF8F5] uppercase tracking-wider font-mono">
              Optical Viewfinder
            </span>
          </div>

          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
            scanning ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-[#142235] text-[#A89F8F] border border-[#18283E]'
          }`}>
            {scanning ? 'CAMERA LIVE' : 'STANDBY'}
          </span>
        </div>

        {/* Video Mount Container */}
        <div className="relative rounded-xl overflow-hidden bg-[#060B12] aspect-square max-h-[320px] mx-auto flex items-center justify-center border border-[#18283E]">
          <div id="qr-reader" className="w-full h-full" />

          {/* Scanner Guide Target Reticle */}
          {scanning && (
            <div className="absolute inset-8 border-2 border-[#FF6B2B]/60 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-full h-0.5 bg-[#FF6B2B] opacity-80 animate-pulse" />
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 bg-[#060B12]/95 p-6 flex flex-col items-center justify-center text-center text-xs text-[#A89F8F]">
              <Camera className="w-8 h-8 text-[#6B6355] mb-2" />
              <p className="mb-2">{cameraError}</p>
              <span className="text-emerald-400 font-bold font-mono">
                ✓ Manual token fallback ready below
              </span>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-4 py-2 text-center text-xs text-[#FF6B2B] font-semibold flex items-center justify-center space-x-2 font-mono">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Resolving student cryptographic identity...</span>
          </div>
        )}
      </div>

      {/* Manual Token Entry Fallback (Crucial for Demo Guarantees) */}
      <div className="bg-[#0A121D] border border-[#18283E] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-2 mb-3">
          <Keyboard className="w-4 h-4 text-[#FF6B2B]" />
          <h2 className="text-sm font-bold text-[#FAF8F5]">Manual Token Fallback</h2>
        </div>
        <p className="text-xs text-[#A89F8F] mb-4">
          If camera permissions are restricted, enter or click a demo student token directly:
        </p>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste token or scan URL..."
              className="flex-1 bg-[#0F1A29] border border-[#18283E] rounded-xl px-4 py-3 text-xs text-[#FAF8F5] placeholder-[#6B6355] focus:outline-none focus:border-[#FF6B2B] font-mono"
            />

            <button
              type="submit"
              disabled={loading || !tokenInput.trim()}
              className="bg-[#FF6B2B] hover:bg-[#EA580C] disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl transition text-xs flex items-center space-x-1.5 shadow-md shadow-[#FF6B2B]/20 active:scale-[0.98]"
            >
              <span>Verify</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* 1-Click Demo Shortcut */}
        <div className="mt-4 pt-4 border-t border-[#18283E]">
          <span className="text-[10px] uppercase font-bold text-[#A89F8F] font-mono tracking-wider block mb-2">
            Presentation 1-Click Pre-loads
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => resolveToken('hs_sec_aniket_stu001_demo')}
              className="p-3 bg-[#0F1A29] hover:bg-[#142235] border border-[#18283E] hover:border-[#223755] rounded-xl text-left transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#FAF8F5] block">Aniket Gaikwad</span>
                <span className="text-[10px] text-[#A89F8F] font-mono">Room B-204 • STU001</span>
              </div>
              <span className="text-xs text-[#FF6B2B] font-bold font-mono">Verify →</span>
            </button>

            <button
              onClick={() => resolveToken('hs_sec_stu002_demo')}
              className="p-3 bg-[#0F1A29] hover:bg-[#142235] border border-[#18283E] hover:border-[#223755] rounded-xl text-left transition flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#FAF8F5] block">Rohan Verma</span>
                <span className="text-[10px] text-[#A89F8F] font-mono">Room A-101 • STU002</span>
              </div>
              <span className="text-xs text-[#FF6B2B] font-bold font-mono">Verify →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
