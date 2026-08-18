'use client';

import React, { useState, useRef } from 'react';
import { Psychiatrist, DoctorSlot, Booking } from '@/lib/types';
import { usePsyNova } from '@/lib/store';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Info,
  Sparkles,
  Smartphone,
  RefreshCw,
  XCircle,
} from 'lucide-react';

interface PayHereCheckoutModalProps {
  doctor: Psychiatrist | null;
  slot: DoctorSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const PayHereCheckoutModal: React.FC<PayHereCheckoutModalProps> = ({
  doctor,
  slot,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, patients } = usePsyNova();

  const activePatientName =
    user.role === 'patient' && user.name && user.name !== 'Guest Visitor' ? user.name : 'Dilshan Silva';
  const activePatientEmail =
    user.role === 'patient' && user.email && user.email !== 'visitor@psynova.lk'
      ? user.email
      : 'dilshan.silva@example.lk';

  const registeredPatient = patients.find((p) => p.email.toLowerCase() === activePatientEmail.toLowerCase());
  const defaultContact = registeredPatient?.phone || '+94 77 987 6543';

  // Patient Info State
  const [patientName, setPatientName] = useState(activePatientName);
  const [patientEmail, setPatientEmail] = useState(activePatientEmail);
  const [patientContact, setPatientContact] = useState(defaultContact);

  // Checkout Mode (defaults to sandbox_terminal for working out-of-the-box flow)
  const [checkoutMode, setCheckoutMode] = useState<'sandbox_terminal' | 'hosted_redirect'>('sandbox_terminal');

  // Custom Merchant ID/Secret for direct Hosted Redirect testing
  const [customMerchantId, setCustomMerchantId] = useState('1236791');

  // Card Input State for In-App Sandbox Terminal
  const [cardNumber, setCardNumber] = useState('4916 2175 0161 1292');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [cardholderName, setCardholderName] = useState(activePatientName);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutParams, setCheckoutParams] = useState<any>(null);

  const [orderId] = useState(() => `BK-${Math.floor(10000 + Math.random() * 90000)}`);
  const formRef = useRef<HTMLFormElement>(null);

  if (!isOpen || !doctor || !slot) return null;

  const dateObj = new Date(slot.datetime);

  // Fill Test Cards
  const handleFillTestCard = (type: 'visa' | 'mastercard' | 'invalid') => {
    if (type === 'visa') {
      setCardNumber('4916 2175 0161 1292');
      setCardExpiry('12/28');
      setCardCvv('123');
      setCardholderName(patientName || 'Dilshan Silva');
    } else if (type === 'mastercard') {
      setCardNumber('5307 7321 2553 1191');
      setCardExpiry('10/27');
      setCardCvv('456');
      setCardholderName(patientName || 'Dilshan Silva');
    } else {
      setCardNumber('4000 0000 0000 0002');
      setCardExpiry('01/22');
      setCardCvv('000');
      setCardholderName('Declined Card');
    }
  };

  // Helper: Execute Server-side Webhook Verification
  const handleExecuteWebhookVerification = async (targetOrderId: string, statusCode: number = 2) => {
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Create pending booking record first
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-pending',
          orderId: targetOrderId,
          doctorId: doctor.id,
          slotId: slot.id,
          slotDatetime: slot.datetime,
          patientName,
          patientEmail,
          patientContact,
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok || !bookingData.booking) {
        throw new Error(bookingData.error || 'Failed to initialize booking record');
      }

      // 2. Call server simulate-notify endpoint to compute and verify real MD5 signature
      const res = await fetch('/api/payments/payhere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate-notify',
          orderId: targetOrderId,
          statusCode,
          amount: doctor.feeLkr,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.booking || data.booking.status !== 'confirmed') {
        throw new Error(data.error || `PayHere Payment Declined (Status code: ${statusCode})`);
      }

      onSuccess(data.booking);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment processing failed on PayHere gateway');
    } finally {
      setLoading(false);
    }
  };

  // Handle Hosted Redirect or JS SDK launch
  const handleProceedHostedRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      // 1. Create pending booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-pending',
          orderId,
          doctorId: doctor.id,
          slotId: slot.id,
          slotDatetime: slot.datetime,
          patientName,
          patientEmail,
          patientContact,
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok || !bookingData.booking) {
        throw new Error(bookingData.error || 'Failed to initialize booking record');
      }

      // 2. Fetch PayHere signed params
      const nameParts = patientName.trim().split(' ');
      const firstName = nameParts[0] || 'Patient';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const clientOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      const paramRes = await fetch('/api/payments/payhere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checkout-params',
          baseUrl: clientOrigin,
          orderId,
          amount: doctor.feeLkr,
          items: `Psychiatry Consultation - ${doctor.name}`,
          firstName,
          lastName,
          email: patientEmail,
          phone: patientContact,
        }),
      });

      const params = await paramRes.json();
      if (!params || !params.hash) {
        throw new Error('Failed to generate PayHere signature hash');
      }

      setCheckoutParams(params);

      // Try PayHere JS SDK Popup first
      if (typeof window !== 'undefined' && (window as any).payhere) {
        try {
          const payhere = (window as any).payhere;
          payhere.onCompleted = function onCompleted(completedOrderId: string) {
            handleExecuteWebhookVerification(completedOrderId || orderId, 2);
          };
          payhere.onDismissed = function onDismissed() {
            setLoading(false);
          };
          payhere.onError = function onError(error: any) {
            console.warn('PayHere SDK Error:', error);
            // Fallback to submitting POST form
            if (formRef.current) formRef.current.submit();
          };

          payhere.startPayment({
            sandbox: true,
            merchant_id: params.merchant_id,
            return_url: params.return_url,
            cancel_url: params.cancel_url,
            notify_url: params.notify_url,
            order_id: orderId,
            items: params.items,
            amount: params.amount,
            currency: params.currency,
            hash: params.hash,
            first_name: params.first_name,
            last_name: params.last_name,
            email: params.email,
            phone: params.phone,
            address: params.address || 'Colombo',
            city: params.city || 'Colombo',
            country: 'Sri Lanka',
          });
          return;
        } catch (sdkErr) {
          console.warn('PayHere SDK launch notice:', sdkErr);
        }
      }

      // Fallback: Submit HTML form
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }, 300);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error initializing PayHere checkout');
      setLoading(false);
    }
  };

  // Handle Terminal Payment
  const handleProceedTerminalPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.startsWith('4000') || cleanCard.endsWith('0002')) {
      handleExecuteWebhookVerification(orderId, -2); // Declined
    } else {
      handleExecuteWebhookVerification(orderId, 2); // Success
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D3728]/70 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F7F5EF] rounded-[28px] shadow-2xl border border-[#768c6e]/30 p-6 sm:p-8 overflow-hidden animate-scale-up max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#768c6e]/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#768c6e]/15 text-[#768c6e]">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#768c6e]/20 text-[#2D3728]">
                  PayHere Payment Gateway
                </span>
                <span className="text-[10px] font-mono text-[#6B7D5E]">Sandbox Mode</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3728]">Telehealth Checkout</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-full hover:bg-[#768c6e]/10 text-[#2D3728]/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {loading ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full border-4 border-[#768c6e] border-t-transparent animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-[#2D3728]">Verifying PayHere MD5 Signature...</h3>
            <p className="text-xs text-[#2D3728]/70 max-w-xs mx-auto font-mono">
              Processing server-to-server notify callback for Order <strong className="text-[#6B7D5E]">{orderId}</strong>
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Consultation Summary Card */}
            <div className="p-4 rounded-2xl bg-white border border-[#768c6e]/20 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-[#768c6e]/15">
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#768c6e]/30"
                />
                <div>
                  <h3 className="font-bold text-[#2D3728] text-sm">{doctor.name}</h3>
                  <p className="text-xs text-[#2D3728]/70">{doctor.title}</p>
                  <p className="text-[11px] font-mono text-[#6B7D5E] mt-0.5">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                    {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Patient Inputs */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Mobile (+94 Notify.lk)</label>
                    <input
                      type="tel"
                      required
                      value={patientContact}
                      onChange={(e) => setPatientContact(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-2xl bg-[#768c6e]/15 text-xs font-bold text-[#2D3728]">
              <button
                type="button"
                onClick={() => setCheckoutMode('hosted_redirect')}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  checkoutMode === 'hosted_redirect'
                    ? 'bg-white shadow text-[#2D3728]'
                    : 'text-[#2D3728]/60 hover:text-[#2D3728]'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" /> Direct Hosted Gateway
              </button>
              <button
                type="button"
                onClick={() => setCheckoutMode('sandbox_terminal')}
                className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  checkoutMode === 'sandbox_terminal'
                    ? 'bg-white shadow text-[#2D3728]'
                    : 'text-[#2D3728]/60 hover:text-[#2D3728]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" /> In-App PayHere Terminal
              </button>
            </div>

            {/* Mode A: Hosted Gateway Redirect */}
            {checkoutMode === 'hosted_redirect' && (
              <form onSubmit={handleProceedHostedRedirect} className="space-y-3">
                {/* PayHere Domain & Merchant ID Explanation */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" /> Why PayHere Shows &quot;Unauthorized payment request&quot;
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    PayHere&apos;s servers (<strong className="font-mono">sandbox.payhere.lk</strong>) validate the Merchant ID against registered accounts. If using a default/test Merchant ID, PayHere blocks the request.
                  </p>
                  <p className="text-[11px] text-amber-900 font-semibold">
                    💡 If you have registered a Sandbox account on <a href="https://sandbox.payhere.lk" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-950">sandbox.payhere.lk</a>, enter your Merchant ID below. Otherwise, use the <strong>In-App PayHere Terminal</strong> tab for immediate testing!
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">
                    PayHere Sandbox Merchant ID
                  </label>
                  <input
                    type="text"
                    value={customMerchantId}
                    onChange={(e) => setCustomMerchantId(e.target.value)}
                    placeholder="e.g. 1224892"
                    className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs font-mono text-[#2D3728]"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#768c6e]/10 border border-[#768c6e]/20 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#2D3728]">Total Fee</span>
                  <span className="font-bold font-mono text-sm text-[#2D3728]">LKR {doctor.feeLkr.toLocaleString()}.00</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3.5 text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Launch PayHere Hosted Checkout (payhere.lk)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Mode B: In-App PayHere Sandbox Terminal */}
            {checkoutMode === 'sandbox_terminal' && (
              <form onSubmit={handleProceedTerminalPayment} className="space-y-4">
                <div className="p-4 rounded-2xl bg-white border border-[#768c6e]/20 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#768c6e]/15 text-xs">
                    <span className="font-bold text-[#2D3728] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#768c6e]" /> Official PayHere Sandbox Test Cards
                    </span>
                    <span className="font-mono text-[10px] text-[#6B7D5E]">MD5 Signature Verified</span>
                  </div>

                  {/* Quick Fill Test Cards */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('visa')}
                      className="px-2 py-1.5 rounded-lg border border-[#768c6e]/30 bg-[#F7F5EF]/80 hover:bg-[#768c6e]/15 text-[11px] font-bold text-[#2D3728] transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Visa Test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('mastercard')}
                      className="px-2 py-1.5 rounded-lg border border-[#768c6e]/30 bg-[#F7F5EF]/80 hover:bg-[#768c6e]/15 text-[11px] font-bold text-[#2D3728] transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Mastercard
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillTestCard('invalid')}
                      className="px-2 py-1.5 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-[11px] font-bold text-rose-800 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3 h-3 text-rose-600" /> Test Decline
                    </button>
                  </div>

                  {/* Card Form Inputs */}
                  <div className="space-y-2.5 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#2D3728]/80 block mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        required
                        value={cardholderName}
                        onChange={(e) => setCardholderName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs font-mono text-[#2D3728]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-[#2D3728]/80 block mb-1">Card Number</label>
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs font-mono tracking-widest text-[#2D3728]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-[#2D3728]/80 block mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs font-mono text-[#2D3728]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-[#2D3728]/80 block mb-1">CVV</label>
                        <input
                          type="text"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-[#768c6e]/30 bg-[#F7F5EF]/50 text-xs font-mono text-[#2D3728]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3.5 text-xs font-bold shadow-lg flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay LKR {doctor.feeLkr.toLocaleString()}.00 via PayHere Sandbox</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Real HTML POST Form targeting PayHere Hosted Checkout Page */}
        {checkoutParams && (
          <form
            ref={formRef}
            action={checkoutParams.checkout_url || 'https://sandbox.payhere.lk/pay/checkout'}
            method="POST"
            className="hidden"
          >
            <input type="hidden" name="merchant_id" value={checkoutParams.merchant_id} />
            <input type="hidden" name="return_url" value={checkoutParams.return_url} />
            <input type="hidden" name="cancel_url" value={checkoutParams.cancel_url} />
            <input type="hidden" name="notify_url" value={checkoutParams.notify_url} />
            <input type="hidden" name="order_id" value={checkoutParams.order_id} />
            <input type="hidden" name="items" value={checkoutParams.items} />
            <input type="hidden" name="currency" value={checkoutParams.currency} />
            <input type="hidden" name="amount" value={checkoutParams.amount} />
            <input type="hidden" name="first_name" value={checkoutParams.first_name} />
            <input type="hidden" name="last_name" value={checkoutParams.last_name} />
            <input type="hidden" name="email" value={checkoutParams.email} />
            <input type="hidden" name="phone" value={checkoutParams.phone} />
            <input type="hidden" name="address" value={checkoutParams.address} />
            <input type="hidden" name="city" value={checkoutParams.city} />
            <input type="hidden" name="country" value={checkoutParams.country} />
            <input type="hidden" name="hash" value={checkoutParams.hash} />
          </form>
        )}
      </div>
    </div>
  );
};
