'use client';

import React, { useState } from 'react';
import { usePsyNova } from '@/lib/store';
import { BoostTier, Booking } from '@/lib/types';
import { JitsiVideoModal } from '@/components/JitsiVideoModal';
import {
  Stethoscope,
  ShieldCheck,
  DollarSign,
  Upload,
  FileText,
  Trash2,
  Crown,
  Video,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';

export const DoctorPortal: React.FC = () => {
  const {
    user,
    psychiatrists,
    bookings,
    uploadDoctorDoc,
    deleteDoctorDoc,
    addDoctorSlot,
    boostPsychiatrist,
    unboostPsychiatrist,
    platformSettings,
  } = usePsyNova();

  // Find practitioner profile
  const currentDoc =
    psychiatrists.find((d) => d.id === user.doctorId || d.slmcRegNo === user.slmcRegNo) ||
    psychiatrists[0];

  // Document upload state
  const [newDocName, setNewDocName] = useState('');
  const [docUploadSuccess, setDocUploadSuccess] = useState(false);

  // Active Jitsi Video session
  const [activeJitsiBooking, setActiveJitsiBooking] = useState<Booking | null>(null);

  // SMSway testing
  const [testSmsPhone, setTestSmsPhone] = useState('');
  const [testSmsMsg, setTestSmsMsg] = useState('PsyNova LK: Your doctor is ready for the tele-consultation.');
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<string | null>(null);

  // Boost promotion alert
  const [boostAlert, setBoostAlert] = useState<{ success: boolean; message: string } | null>(null);

  // Slot Creation State
  const todayStr = new Date().toISOString().split('T')[0];
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('09:00');
  const [slotDuration, setSlotDuration] = useState(45);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [slotSuccess, setSlotSuccess] = useState<string | null>(null);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setSlotError(null);
    setSlotSuccess(null);

    if (!slotDate) {
      setSlotError('Please select a valid consultation date.');
      return;
    }

    const selectedDateTime = new Date(`${slotDate}T${slotTime}:00`);
    if (selectedDateTime <= new Date()) {
      setSlotError('Past dates and times are strictly prohibited! Please select a future date and time for booking availability.');
      return;
    }

    const newSlot = {
      id: `slot-${Date.now()}`,
      datetime: selectedDateTime.toISOString(),
      durationMins: slotDuration,
      status: 'available' as const,
    };

    addDoctorSlot(currentDoc.id, newSlot);
    setSlotSuccess(`Future slot added successfully for ${selectedDateTime.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`);
    setSlotDate('');
  };

  // Consultations related to this doctor
  const doctorBookings = bookings.filter((b) => b.doctorId === currentDoc.id);

  // Financial Math
  const grossEarnings = doctorBookings.reduce((sum, b) => sum + b.feeLkr, 0);
  const platformCommission = doctorBookings.reduce((sum, b) => sum + b.platformCommissionLkr, 0);
  const netEarnings = doctorBookings.reduce((sum, b) => sum + b.netDoctorEarningLkr, 0);

  // Total platform-wide boosted count
  const boostedCount = psychiatrists.filter((d) => d.isBoosted).length;

  const handleDocUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName) return;
    uploadDoctorDoc(currentDoc.id, newDocName);
    setDocUploadSuccess(true);
    setNewDocName('');
    setTimeout(() => setDocUploadSuccess(false), 2000);
  };

  const handleBoost = (tier: BoostTier) => {
    const res = boostPsychiatrist(currentDoc.id, tier);
    setBoostAlert(res);
    setTimeout(() => setBoostAlert(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Doctor Portal Header */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentDoc.photo}
            alt={currentDoc.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#768c6e]/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#2D3728]">{currentDoc.name}</h1>
              {currentDoc.status === 'approved' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#768c6e]/15 text-[#6B7D5E] border border-[#768c6e]/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> SLMC Approved Practitioner
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-[#2D3728]/80 mt-0.5">{currentDoc.title}</p>
            <p className="text-xs font-mono text-[#6B7D5E] mt-1">
              Practitioner ID: {currentDoc.id} • SLMC Reg: {currentDoc.slmcRegNo}
            </p>
          </div>
        </div>

        {/* Current Boost Badge */}
        <div className="p-4 rounded-2xl bg-white/80 border border-[#768c6e]/20 text-xs space-y-1 text-right">
          <span className="text-[#2D3728]/70 block font-medium">Spotlight Status</span>
          {currentDoc.isBoosted ? (
            <span className="font-bold text-amber-800 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full inline-flex items-center gap-1">
              👑 Active ({currentDoc.boostTier})
            </span>
          ) : (
            <span className="font-semibold text-[#2D3728]/70">Standard Directory Listing</span>
          )}
        </div>
      </div>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Gross */}
        <div className="psynova-card p-6 space-y-2">
          <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Gross Consultations</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2D3728] font-mono">
            LKR {grossEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#2D3728]/60">{doctorBookings.length} total sessions booked</p>
        </div>

        {/* Card 2: Platform Commission */}
        <div className="psynova-card p-6 space-y-2">
          <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">
            Platform Commission ({platformSettings.commissionRate}%)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#2D3728] font-mono">
            LKR {platformCommission.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#2D3728]/60">Deducted for tele-hosting & Notify.lk notifications</p>
        </div>

        {/* Card 3: Net Earnings (Solid Olive) */}
        <div className="p-6 rounded-[22px] bg-[#6B7D5E] text-[#F7F5EF] shadow-lg space-y-2 border border-[#6B7D5E]">
          <span className="text-xs font-semibold text-[#F7F5EF]/80 uppercase tracking-wider block">
            Net Doctor Earnings
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono">
            LKR {netEarnings.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#F7F5EF]/80">Disbursed via automated admin payout cycle</p>
        </div>
      </div>

      {/* Boost Promotion Alert */}
      {boostAlert && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            boostAlert.success
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{boostAlert.message}</span>
        </div>
      )}

      {/* Profile Boosting Promotion Packages */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#768c6e]/15 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#2D3728] flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-600" /> Doctor Profile Boosting Packages
            </h2>
            <p className="text-xs text-[#2D3728]/70 mt-0.5">
              Increase patient reach by featuring your profile with a crown badge at the top of doctor directory.
            </p>
          </div>
          <div className="text-xs font-mono font-bold bg-[#768c6e]/15 text-[#6B7D5E] px-3 py-1.5 rounded-full border border-[#768c6e]/20">
            Platform Boost Slots: {boostedCount} / {platformSettings.maxBoostedDoctors} Max
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Package 1: 1-Day Boost - LKR 500 */}
          <div className="p-6 rounded-2xl bg-white/80 border border-[#768c6e]/20 space-y-4 hover:border-[#768c6e] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B7D5E] bg-[#768c6e]/10 px-2.5 py-0.5 rounded-full">
                1-Day Boost
              </span>
              <span className="text-xl font-extrabold font-mono text-[#2D3728]">LKR 500</span>
            </div>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Crown featured badge & top listing priority for 24 hours.
            </p>
            <button
              onClick={() => handleBoost('1-day')}
              className="btn-primary w-full text-xs py-2.5"
            >
              Request 1-Day Boost (LKR 500)
            </button>
          </div>

          {/* Package 2: 3-Day Prime Boost - LKR 1,400 */}
          <div className="p-6 rounded-2xl bg-white/80 border-2 border-amber-500/40 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                3-Day Prime Boost
              </span>
              <span className="text-xl font-extrabold font-mono text-[#2D3728]">LKR 1,400</span>
            </div>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Maximum visibility package: Crown badge + priority ranking across all search filters for 72 hours.
            </p>
            <button
              onClick={() => handleBoost('3-day')}
              className="btn-primary w-full text-xs py-2.5 bg-amber-700 hover:bg-amber-800"
            >
              Request 3-Day Prime Boost (LKR 1,400)
            </button>
          </div>
        </div>

        {currentDoc.isBoosted && (
          <div className="pt-2">
            <button
              onClick={() => unboostPsychiatrist(currentDoc.id)}
              className="btn-secondary text-xs py-1.5 px-4 text-[#D9635A] border-[#D9635A]/50 hover:bg-[#D9635A]/10"
            >
              Cancel Current Boost
            </button>
          </div>
        )}
      </div>

      {/* Future Consultation Availability Slots Manager */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-6">
        <div className="border-b border-[#768c6e]/15 pb-4">
          <h2 className="text-xl font-bold text-[#2D3728] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#768c6e]" /> Manage Future Availability Slots
          </h2>
          <p className="text-xs text-[#2D3728]/70 mt-0.5">
            Add future consultation slots for patient bookings. Past dates and times are strictly disallowed.
          </p>
        </div>

        {/* Slot Creation Form */}
        <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Select Future Date</label>
            <input
              type="date"
              required
              min={todayStr}
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Start Time</label>
            <input
              type="time"
              required
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">Duration (Mins)</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728] focus:outline-none"
            >
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes</option>
            </select>
          </div>
          <div>
            <button type="submit" className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Add Future Slot
            </button>
          </div>
        </form>

        {slotError && (
          <div className="p-3 rounded-xl bg-red-100 text-red-900 border border-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{slotError}</span>
          </div>
        )}

        {slotSuccess && (
          <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{slotSuccess}</span>
          </div>
        )}

        {/* Existing Upcoming Slots List */}
        <div>
          <h3 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider mb-2">Active Future Slots</h3>
          {currentDoc.upcomingSlots.length === 0 ? (
            <p className="text-xs text-[#2D3728]/70 italic p-4 rounded-xl bg-white/50 border border-[#768c6e]/15">
              No future slots listed. Please use the form above to add future consultation hours.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {currentDoc.upcomingSlots.map((s) => {
                const dateObj = new Date(s.datetime);
                const isPast = dateObj <= new Date();
                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between ${
                      isPast
                        ? 'bg-red-50/60 border-red-200 text-red-700 opacity-60'
                        : s.status === 'booked'
                        ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                        : 'bg-white/80 border-[#768c6e]/20 text-[#2D3728]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">
                        {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-mono uppercase font-bold">
                        {isPast ? 'Past (Invalid)' : s.status}
                      </span>
                    </div>
                    <span className="text-xs font-mono mt-1 font-medium">
                      {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({s.durationMins}m)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SLMC Qualification Document Storage */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-6">
        <div className="border-b border-[#768c6e]/15 pb-4">
          <h2 className="text-xl font-bold text-[#2D3728] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#768c6e]" /> SLMC Qualification Document Vault
          </h2>
          <p className="text-xs text-[#2D3728]/70 mt-0.5">
            Store and manage your SLMC Medical Board registration, MBBS certificates, and specialization degrees.
          </p>
        </div>

        {/* Document Upload Form */}
        <form onSubmit={handleDocUpload} className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            required
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            placeholder="e.g. SLMC_Renewal_Certificate_2026.pdf"
            className="flex-1 w-full px-4 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728] focus:outline-none"
          />
          <button type="submit" className="btn-primary text-xs py-2.5 px-5 shrink-0 whitespace-nowrap">
            <Upload className="w-3.5 h-3.5" /> Upload Document
          </button>
        </form>

        {docUploadSuccess && (
          <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Document uploaded for SLMC admin verification.
          </p>
        )}

        {/* Document List */}
        <div className="space-y-2">
          {currentDoc.documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-2xl bg-white/80 border border-[#768c6e]/15 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#768c6e]" />
                <div>
                  <span className="font-semibold text-[#2D3728] block">{doc.name}</span>
                  <span className="text-[11px] text-[#2D3728]/60">Uploaded on {doc.uploadDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    doc.status === 'Approved'
                      ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                  }`}
                >
                  {doc.status}
                </span>

                <button
                  onClick={() => deleteDoctorDoc(currentDoc.id, doc.id)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attended Consultations & Session Log */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2D3728]">Patient Consultation Log</h2>
        <div className="rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#768c6e]/10 border-b border-[#768c6e]/20 text-[#6B7D5E] font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-4">Booking ID</th>
                <th className="p-4">Patient Contact</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Gross Fee</th>
                <th className="p-4">Net Doctor Earning</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#768c6e]/15">
              {doctorBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#2D3728]/70 italic">
                    No sessions logged yet.
                  </td>
                </tr>
              ) : (
                doctorBookings.map((bk) => {
                  const dateObj = new Date(bk.slotDatetime);
                  return (
                    <tr key={bk.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#2D3728]">{bk.id}</td>
                      <td className="p-4">
                        <span className="font-semibold text-[#2D3728] block">{bk.patientName}</span>
                        <span className="text-[11px] text-[#2D3728]/60 font-mono">{bk.patientContact}</span>
                      </td>
                      <td className="p-4 text-[#2D3728]/80 font-mono">
                        {dateObj.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="p-4 font-mono text-[#2D3728]">LKR {bk.feeLkr.toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold text-[#6B7D5E]">
                        LKR {bk.netDoctorEarningLkr.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        {bk.status === 'confirmed' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async () => {
                                try {
                                  await fetch('/api/sms', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ action: 'reminder-5min', booking: bk }),
                                  });
                                  alert(`5-Minute Pre-Session Reminder SMS dispatched to ${bk.patientName} (${bk.patientContact})!`);
                                } catch (err: any) {
                                  alert('Failed to send reminder SMS: ' + err.message);
                                }
                              }}
                              className="btn-secondary text-[11px] py-1.5 px-3 inline-flex items-center gap-1 border-[#768c6e] text-[#6B7D5E]"
                            >
                              <Clock className="w-3.5 h-3.5" /> Send 5-Min Reminder SMS
                            </button>
                            <button
                              onClick={() => setActiveJitsiBooking(bk)}
                              className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1 shadow-sm"
                            >
                              <Video className="w-3.5 h-3.5" /> Start Jitsi Call
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notify.lk Sri Lanka Patient Notification Dispatcher */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-4">
        <div className="border-b border-[#768c6e]/15 pb-3">
          <h2 className="text-xl font-bold text-[#2D3728]">Notify.lk Patient Notification Console</h2>
          <p className="text-xs text-[#2D3728]/70 mt-0.5">
            Directly dispatch SMS alerts to Sri Lankan patient mobile numbers (+94) via official Notify.lk telco gateway.
          </p>
        </div>

        {smsResult && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{smsResult}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#2D3728]/80 block">Patient Phone (+94 SL)</label>
              {doctorBookings.length > 0 && (
                <select
                  onChange={(e) => {
                    if (e.target.value) setTestSmsPhone(e.target.value);
                  }}
                  className="text-[10px] bg-white border border-[#768c6e]/30 rounded px-1.5 py-0.5 text-[#2D3728]"
                >
                  <option value="">Select booking...</option>
                  {doctorBookings.map((bk) => (
                    <option key={bk.id} value={bk.patientContact}>
                      {bk.patientName} ({bk.patientContact})
                    </option>
                  ))}
                </select>
              )}
            </div>
            <input
              type="tel"
              value={testSmsPhone || (doctorBookings[0]?.patientContact || '')}
              onChange={(e) => setTestSmsPhone(e.target.value)}
              placeholder="e.g. +94771234567"
              className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs font-mono text-[#2D3728]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-[#2D3728]/80 block mb-1">SMS Message</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={testSmsMsg}
                onChange={(e) => setTestSmsMsg(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728]"
              />
              <button
                onClick={async () => {
                  const recipient = testSmsPhone || (doctorBookings[0]?.patientContact || '+94771234567');
                  setSmsSending(true);
                  setSmsResult(null);
                  try {
                    const res = await fetch('/api/sms', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ recipient, message: testSmsMsg }),
                    });
                    const data = await res.json();
                    setSmsResult(`Notify.lk Dispatched to ${recipient}! Status: ${data.status || 'Success'} (ID: ${data.messageId || 'NOTIFYLK-102'})`);
                  } catch (e: any) {
                    setSmsResult('Notify.lk dispatch error: ' + e.message);
                  } finally {
                    setSmsSending(false);
                  }
                }}
                disabled={smsSending}
                className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
              >
                {smsSending ? 'Dispatching...' : 'Send Notify.lk Alert'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Jitsi Video Telehealth Modal */}
      <JitsiVideoModal
        booking={activeJitsiBooking}
        isOpen={!!activeJitsiBooking}
        onClose={() => setActiveJitsiBooking(null)}
      />
    </div>
  );
};
