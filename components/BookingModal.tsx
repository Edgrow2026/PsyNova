'use client';

import React, { useState } from 'react';
import { Psychiatrist, DoctorSlot, Booking } from '@/lib/types';
import { usePsyNova } from '@/lib/store';
import { X, Calendar, Clock, CreditCard, Lock, CheckCircle2, ShieldCheck, Video, AlertCircle } from 'lucide-react';

interface BookingModalProps {
  doctor: Psychiatrist | null;
  slot: DoctorSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ doctor, slot, isOpen, onClose, onSuccess }) => {
  const { createBooking, user, patients } = usePsyNova();

  const registeredPatient = patients.find((p) => p.email.toLowerCase() === (user.email || '').toLowerCase());
  const defaultContact = registeredPatient?.phone || '+94 77 987 6543';

  const [step, setStep] = useState<'details' | 'payhere' | 'success'>('details');
  const [patientName, setPatientName] = useState(user.name || '');
  const [patientEmail, setPatientEmail] = useState(user.email || '');
  const [patientContact, setPatientContact] = useState(defaultContact);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  if (!isOpen || !doctor || !slot) return null;

  const dateObj = new Date(slot.datetime);

  const handlePayHereCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);

    // Simulate PayHere server-side LKR MD5 Hash validation
    setTimeout(() => {
      const res = createBooking({
        doctorId: doctor.id,
        slotId: slot.id,
        slotDatetime: slot.datetime,
        patientName,
        patientEmail,
        patientContact,
      });

      setIsProcessing(false);

      if (res.success && res.booking) {
        setCreatedBooking(res.booking);
        setStep('success');
        onSuccess(res.booking);
      } else {
        setErrorMessage(res.error || 'Failed to complete transaction.');
      }
    }, 1200);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F7F5EF] rounded-[28px] shadow-2xl border border-[#768c6e]/20 p-6 sm:p-8 overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#768c6e]/15">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7D5E]">
              {step === 'success' ? 'Booking Confirmed' : 'Private Consultation Checkout'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D3728]">
              {step === 'success' ? 'Telehealth Session Ready' : `Book with ${doctor.name}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#768c6e]/10 text-[#2D3728]/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1 & 2: Details & PayHere Simulation */}
        {step !== 'success' && (
          <form onSubmit={handlePayHereCheckout} className="mt-5 space-y-4">
            {/* Slot Summary Tile */}
            <div className="p-4 rounded-2xl bg-white/80 border border-[#768c6e]/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#6B7D5E]">
                <span>Selected Time Slot</span>
                <span className="text-[#2D3728] font-mono">SLMC Reg: {doctor.slmcRegNo}</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-[#2D3728]">
                <div className="p-2 rounded-xl bg-[#768c6e]/15 text-[#768c6e]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p>{dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  <p className="text-xs text-[#2D3728]/70 font-mono font-normal">
                    {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({slot.durationMins} Mins Video Telehealth)
                  </p>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Full Patient Name</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                  placeholder="e.g. Dilshan Silva"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                    placeholder="email@example.lk"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Mobile (for Notify.lk SMS)</label>
                  <input
                    type="tel"
                    required
                    value={patientContact}
                    onChange={(e) => setPatientContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                    placeholder="+94 77 000 0000"
                  />
                </div>
              </div>
            </div>

            {/* Fee & PayHere Security Band */}
            <div className="p-4 rounded-2xl bg-[#768c6e]/10 border border-[#768c6e]/20 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#2D3728]/80">Consultation Fee</span>
                <span className="font-bold text-[#2D3728] font-mono">LKR {doctor.feeLkr.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-[#2D3728]/70 border-t border-[#768c6e]/15 pt-2">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#768c6e]" /> PayHere Secure LKR Hash Verification
                </span>
                <span className="text-[11px] font-mono bg-white/60 px-2 py-0.5 rounded border border-[#768c6e]/20">MD5 SHA256</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full btn-primary py-3 text-sm font-semibold shadow-md flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span>Generating PayHere LKR Token...</span>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Pay LKR {doctor.feeLkr.toLocaleString()} via PayHere
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 'success' && createdBooking && (
          <div className="mt-5 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-[#768c6e]/20 text-[#768c6e] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#2D3728]">Consultation Reserved Successfully!</h3>
              <p className="text-xs text-[#2D3728]/70 mt-1">
                SMS notification sent via Notify.lk to <strong className="text-[#2D3728]">{createdBooking.patientContact}</strong>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-[#768c6e]/20 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#2D3728]/70">Booking ID:</span>
                <span className="font-mono font-bold text-[#2D3728]">{createdBooking.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2D3728]/70">PayHere Ref:</span>
                <span className="font-mono text-[#6B7D5E]">{createdBooking.payhereRef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2D3728]/70">Doctor:</span>
                <span className="font-semibold text-[#2D3728]">{createdBooking.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#2D3728]/70">Scheduled Time:</span>
                <span className="font-mono text-[#2D3728]">{dateObj.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>

            <a
              href={createdBooking.videoLink}
              target="_blank"
              rel="noreferrer"
              className="btn-primary w-full py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" /> Launch Telehealth Video Room
            </a>

            <button
              onClick={onClose}
              className="btn-secondary w-full py-2.5 text-xs font-semibold text-[#2D3728]"
            >
              Close & View My Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
