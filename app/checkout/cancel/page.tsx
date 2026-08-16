'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('order_id') || '';

  return (
    <div className="min-h-screen bg-[#F7F5EF] py-12 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-[#768c6e]/20 p-8 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
            Checkout Cancelled
          </span>
          <h1 className="text-2xl font-bold text-[#2D3728]">Payment Cancelled</h1>
          <p className="text-xs text-[#2D3728]/70">
            You cancelled the transaction on PayHere hosted checkout gateway. No funds were debited and your booking was not confirmed.
          </p>
        </div>

        {orderId && (
          <div className="p-3 bg-[#F7F5EF] rounded-xl border border-[#768c6e]/20 text-xs font-mono text-[#2D3728]">
            Order ID: <strong>{orderId}</strong>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <button
            onClick={() => router.push('/?tab=psychiatrists')}
            className="w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <RefreshCcw className="w-4 h-4" /> Try Booking Again
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 px-4 rounded-xl border border-[#768c6e]/30 text-xs font-semibold text-[#2D3728] hover:bg-[#768c6e]/10 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading cancellation status...</div>}>
      <CancelContent />
    </Suspense>
  );
}
