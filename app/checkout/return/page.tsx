'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Booking } from '@/lib/types';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Video,
  Printer,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';

function ReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || '';

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkStatus = async () => {
      if (!orderId) {
        if (isMounted) setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/bookings?id=${orderId}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) setBooking(data);
        } else {
          const errData = await res.json();
          if (isMounted) setError(errData.error || 'Booking record not found');
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Error checking payment verification status');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId]);

  const handleSimulateWebhook = async (statusCode: number) => {
    if (!orderId) return;
    setSimulating(true);
    try {
      const res = await fetch('/api/payments/payhere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulate-notify', orderId, statusCode }),
      });
      const data = await res.json();
      if (data.booking) {
        setBooking(data.booking);
      }
    } catch (e) {
      console.error('Simulation error:', e);
    } finally {
      setSimulating(false);
    }
  };

  if (loading && !booking) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#768c6e] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#2D3728]">Checking PayHere Server-to-Server Verification...</p>
        <p className="text-xs text-[#2D3728]/60 mt-1 font-mono">Verifying MD5 SHA256 Signature for Order {orderId}</p>
      </div>
    );
  }

  const isConfirmed = booking?.status === 'confirmed' && booking?.paymentStatus === 'paid';
  const isPending = booking?.status === 'pending';
  const isFailed = booking?.status === 'cancelled' || booking?.paymentStatus === 'pending' && !isPending;

  return (
    <div className="min-h-screen bg-[#F7F5EF] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#768c6e]/20 p-8 space-y-6 text-center">
        {/* Status Header */}
        {isConfirmed ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              PayHere Notify Callback Verified
            </span>
            <h1 className="text-2xl font-bold text-[#2D3728]">Payment Successful!</h1>
            <p className="text-xs text-[#2D3728]/70">
              Verified with MD5 signature (PayHere status code 2). Your consultation is confirmed.
            </p>
          </div>
        ) : isPending ? (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-10 h-10 animate-pulse" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
              Payment Verification Pending
            </span>
            <h1 className="text-2xl font-bold text-[#2D3728]">Awaiting Webhook Callback</h1>
            <p className="text-xs text-[#2D3728]/70">
              PayHere server notification is currently processing. Status will update automatically once verified.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <XCircle className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              Payment Failed or Declined
            </span>
            <h1 className="text-2xl font-bold text-[#2D3728]">Transaction Unsuccessful</h1>
            <p className="text-xs text-[#2D3728]/70">
              The payment was not verified or was declined by PayHere. No appointment was confirmed.
            </p>
          </div>
        )}

        {/* Booking Details Card */}
        {booking && (
          <div className="bg-[#F7F5EF]/80 rounded-2xl p-4 border border-[#768c6e]/20 text-left text-xs space-y-2.5 font-mono text-[#2D3728]">
            <div className="flex justify-between border-b border-[#768c6e]/15 pb-1.5">
              <span className="text-[#2D3728]/60">Booking Reference:</span>
              <span className="font-bold">{booking.id}</span>
            </div>
            <div className="flex justify-between border-b border-[#768c6e]/15 pb-1.5">
              <span className="text-[#2D3728]/60">Doctor:</span>
              <span className="font-semibold">{booking.doctorName}</span>
            </div>
            <div className="flex justify-between border-b border-[#768c6e]/15 pb-1.5">
              <span className="text-[#2D3728]/60">Consultation Fee:</span>
              <span className="font-bold">LKR {booking.feeLkr.toLocaleString()}.00</span>
            </div>
            <div className="flex justify-between border-b border-[#768c6e]/15 pb-1.5">
              <span className="text-[#2D3728]/60">Payment Status:</span>
              <span className={`font-bold uppercase ${isConfirmed ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-rose-700'}`}>
                {booking.paymentStatus}
              </span>
            </div>
            {isConfirmed && (
              <div className="flex justify-between pt-1">
                <span className="text-[#2D3728]/60">PayHere Ref:</span>
                <span className="text-emerald-700 truncate max-w-[160px]">{booking.payhereRef}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isConfirmed && booking?.videoLink && (
            <a
              href={booking.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Video className="w-4 h-4" /> Join Telehealth Consultation
            </a>
          )}

          {isPending && (
            <button
              onClick={() => window.location.reload()}
              className="w-full btn-secondary py-3 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4 animate-spin" /> Refresh Server Verification
            </button>
          )}

          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 px-4 rounded-xl border border-[#768c6e]/30 text-xs font-semibold text-[#2D3728] hover:bg-[#768c6e]/10 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to PsyNova Homepage
          </button>
        </div>

        {/* Developer Testing Panel */}
        <div className="pt-4 border-t border-dashed border-[#768c6e]/30 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#6B7D5E] uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Dev Mode: Webhook Simulation
          </div>
          <p className="text-[11px] text-slate-500 mb-2">
            Test server-to-server notify webhook MD5 verification directly in local sandbox environment:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={simulating}
              onClick={() => handleSimulateWebhook(2)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Simulate Success (Code 2)
            </button>
            <button
              disabled={simulating}
              onClick={() => handleSimulateWebhook(-2)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Simulate Failure (Code -2)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading return status...</div>}>
      <ReturnContent />
    </Suspense>
  );
}
