'use client';

import React, { useState } from 'react';
import { Psychiatrist, DoctorSlot } from '@/lib/types';
import { usePsyNova } from '@/lib/store';
import { X, UserCheck, LogIn, UserPlus, ShieldCheck, Calendar, Clock, CreditCard, Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface GuestAuthModalProps {
  isOpen: boolean;
  doctor: Psychiatrist | null;
  slot: DoctorSlot | null;
  onClose: () => void;
  onAuthSuccess: (patientData: { name: string; email: string; contact: string }) => void;
}

export const GuestAuthModal: React.FC<GuestAuthModalProps> = ({
  isOpen,
  doctor,
  slot,
  onClose,
  onAuthSuccess,
}) => {
  const { setUserRole, registerPatient, loginUser, patients } = usePsyNova();
  const [tab, setTab] = useState<'signup' | 'signin'>('signup');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [district, setDistrict] = useState('Colombo');
  const [password, setPassword] = useState('');

  if (!isOpen || !doctor || !slot) return null;

  const dateObj = new Date(slot.datetime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const patientName = name.trim();
    const patientEmail = email.trim();
    const patientContact = contact.trim();

    if (tab === 'signup') {
      if (!patientName) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (!patientEmail) {
        setErrorMsg('Please enter your email address.');
        return;
      }

      const res = registerPatient({
        name: patientName,
        email: patientEmail,
        phone: patientContact,
        district,
        password,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Registration failed.');
        return;
      }

      onAuthSuccess({
        name: patientName,
        email: patientEmail,
        contact: patientContact,
      });
    } else {
      // Sign In mode
      const res = loginUser(patientEmail, password, 'patient');
      if (!res.success) {
        setErrorMsg(res.error || 'Sign in failed.');
        return;
      }

      // Retrieve logged in user's details
      const foundPatient = patients.find((p) => p.email.toLowerCase() === patientEmail.toLowerCase());
      onAuthSuccess({
        name: foundPatient ? foundPatient.name : patientEmail.split('@')[0],
        email: patientEmail,
        contact: foundPatient ? foundPatient.phone : patientContact,
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D3728]/70 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F7F5EF] rounded-[28px] shadow-2xl border border-[#768c6e]/20 p-6 sm:p-8 overflow-hidden animate-scale-up space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#768c6e]/15">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#768c6e]/15 text-[#768c6e]">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#768c6e]/20 text-[#2D3728]">
                Patient Account Required
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3728]">
                Sign In to Book Session
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#768c6e]/10 text-[#2D3728]/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Consultation Context Banner */}
        <div className="p-4 rounded-2xl bg-white border border-[#768c6e]/20 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#6B7D5E] font-semibold">
            <span>Consultation Summary</span>
            <span className="font-mono text-[#2D3728]">LKR {doctor.feeLkr.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-[#2D3728]">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="w-10 h-10 rounded-xl object-cover border border-[#768c6e]/30"
            />
            <div>
              <p className="text-sm font-bold">{doctor.name}</p>
              <p className="text-[11px] text-[#2D3728]/70 font-normal">
                {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({slot.durationMins}m)
              </p>
            </div>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex rounded-2xl bg-[#768c6e]/15 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setTab('signup');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'signup'
                ? 'bg-white text-[#2D3728] shadow-sm font-bold'
                : 'text-[#2D3728]/70 hover:text-[#2D3728]'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#768c6e]" /> Create Free Patient Account
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setTab('signin');
            }}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'signin'
                ? 'bg-white text-[#2D3728] shadow-sm font-bold'
                : 'text-[#2D3728]/70 hover:text-[#2D3728]'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#768c6e]" /> Sign In Existing
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {tab === 'signup' && (
            <>
              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">Full Patient Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dilshan Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dilshan@example.lk"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">District (Sri Lanka)</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728]"
                >
                  {['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'Kalutara', 'Matara', 'Badulla', 'Anuradhapura'].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Pass12#"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                />
                <p className="text-[11px] text-[#2D3728]/60 mt-1.5 leading-tight bg-[#768c6e]/10 p-2 rounded-lg border border-[#768c6e]/20">
                  <span className="font-semibold text-[#2D3728]">Password rules:</span> 6–10 characters, at least 1 uppercase, 1 lowercase, 1 special character (!@#$%^&*), and min 2 digits.
                </p>
              </div>
            </>
          )}

          {tab === 'signin' && (
            <>
              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">Patient Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dilshan@example.lk"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Pass12#"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-sm text-[#2D3728]"
                />
              </div>
            </>
          )}

          <div className="p-3 rounded-xl bg-[#768c6e]/10 border border-[#768c6e]/20 flex items-center justify-between text-[11px] text-[#2D3728]/80">
            <span className="flex items-center gap-1 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#768c6e]" /> End-to-End Confidentiality & SLMC Policy
            </span>
            <span className="font-mono text-[#6B7D5E] font-bold">100% Secure</span>
          </div>

          <button
            type="submit"
            className="btn-primary w-full py-3.5 text-sm font-bold shadow-md flex items-center justify-center gap-2"
          >
            <span>{tab === 'signup' ? 'Complete Sign Up & Book Session' : 'Sign In & Book Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
