'use client';

import React, { useState, useEffect } from 'react';
import { Psychiatrist, DoctorSlot } from '@/lib/types';
import { usePsyNova } from '@/lib/store';
import { X, Star, Calendar, Clock, Languages, Video, ShieldCheck, ThumbsUp, MessageSquare, Award, CheckCircle2 } from 'lucide-react';

interface DoctorModalProps {
  doctor: Psychiatrist | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBook: (doctor: Psychiatrist, selectedSlot: DoctorSlot) => void;
}

export const DoctorModal: React.FC<DoctorModalProps> = ({ doctor, isOpen, onClose, onProceedToBook }) => {
  const { reviews, voteHelpfulReview } = usePsyNova();
  // Only future slots are eligible for selection
  const futureSlots = (doctor?.upcomingSlots || []).filter((s) => new Date(s.datetime) > new Date());
  const availableSlot = futureSlots.find((s) => s.status === 'available') || null;
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // Derive active selected slot
  const selectedSlot =
    futureSlots.find((s) => s.id === selectedSlotId && s.status === 'available') ||
    availableSlot;

  // Press Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doctor) return null;

  const doctorReviews = reviews.filter((r) => r.doctorId === doctor.id);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[90vh] bg-[#F7F5EF] rounded-[28px] shadow-2xl border border-[#768c6e]/20 flex flex-col overflow-hidden animate-scale-up"
      >
        {/* Sticky Header Band */}
        <div className="sticky top-0 z-20 bg-[#F7F5EF] p-5 sm:p-6 border-b border-[#768c6e]/20 flex items-start justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={doctor.photo}
              alt={doctor.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#768c6e]/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-[#2D3728]">{doctor.name}</h2>
                {doctor.isBoosted && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
                    👑
                  </span>
                )}
                {doctor.status === 'approved' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#768c6e]/15 text-[#6B7D5E] border border-[#768c6e]/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> SLMC Verified
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#2D3728]/80 mt-0.5">{doctor.title}</p>
              <p className="text-xs font-mono text-[#6B7D5E] mt-1">Reg: {doctor.slmcRegNo} • {doctor.district} District</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#768c6e]/15 text-[#2D3728]/80 transition-colors shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Section 2: About Doctor Bio */}
          <div>
            <h3 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider mb-2">About Clinical Practice</h3>
            <p className="text-sm text-[#2D3728]/85 leading-relaxed bg-white/60 p-4 rounded-2xl border border-[#768c6e]/15">
              {doctor.bio}
            </p>
          </div>

          {/* Section 3: Two Info Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/60 border border-[#768c6e]/15 flex items-start gap-3">
              <Languages className="w-5 h-5 text-[#768c6e] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Consultation Languages</h4>
                <p className="text-sm font-medium text-[#2D3728] mt-1">{doctor.languages.join(' • ')}</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/60 border border-[#768c6e]/15 flex items-start gap-3">
              <Video className="w-5 h-5 text-[#768c6e] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Session Format</h4>
                <p className="text-sm font-medium text-[#2D3728] mt-1">{doctor.sessionFormats.join(' • ')}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Upcoming Available Slots */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#768c6e]" /> Select Available Slot
              </h3>
              <span className="text-xs text-[#2D3728]/70">Next 7 Days</span>
            </div>

            {futureSlots.length === 0 ? (
              <p className="text-xs text-[#2D3728]/70 italic p-4 rounded-xl bg-white/40 border border-[#768c6e]/15">
                No open future slots currently listed. Past slots are not allowed. Please check back soon or contact support.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {futureSlots.map((s) => {
                  const dateObj = new Date(s.datetime);
                  const isSelected = selectedSlot?.id === s.id;
                  const isBooked = s.status === 'booked';

                  return (
                    <button
                      key={s.id}
                      disabled={isBooked}
                      onClick={() => setSelectedSlotId(s.id)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col ${
                        isBooked
                          ? 'bg-gray-100/60 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                          : isSelected
                          ? 'bg-[#768c6e] text-[#F7F5EF] border-[#768c6e] shadow-md'
                          : 'bg-white/80 hover:bg-white text-[#2D3728] border-[#768c6e]/20 hover:border-[#768c6e]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {isBooked && <span className="text-[10px] font-mono text-red-500">Booked</span>}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs font-mono font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} ({s.durationMins}m)
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Ratings & Reviews (Play Store Style) */}
          <div className="pt-4 border-t border-[#768c6e]/20 space-y-4">
            <h3 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> Patient Feedback & Rating Overview
            </h3>

            {/* Play Store Rating Bar Chart */}
            <div className="p-5 rounded-2xl bg-white/70 border border-[#768c6e]/20 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="text-center sm:border-r sm:border-[#768c6e]/15 sm:pr-6">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#2D3728]">{doctor.rating.toFixed(1)}</span>
                <div className="flex items-center justify-center gap-1 my-1">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <Star key={st} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <span className="text-xs text-[#2D3728]/70 font-medium">{doctor.reviewCount} Verified Ratings</span>
              </div>

              {/* Bar Chart */}
              <div className="sm:col-span-2 space-y-1.5 text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = doctor.ratingDistribution[stars as 1|2|3|4|5] || 0;
                  const pct = doctor.reviewCount > 0 ? (count / doctor.reviewCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="w-3 font-mono font-medium text-right text-[#2D3728]">{stars}</span>
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#768c6e] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] text-[#2D3728]/60 font-mono">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-3">
              {doctorReviews.length === 0 ? (
                <p className="text-xs text-[#2D3728]/70 italic">No public reviews submitted yet for this specialist.</p>
              ) : (
                doctorReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white/70 border border-[#768c6e]/15 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#768c6e]/20 text-[#6B7D5E] font-bold text-xs flex items-center justify-center">
                          {rev.patientName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-[#2D3728]">{rev.patientName}</span>
                            {rev.isVerified && (
                              <span className="text-[10px] font-semibold text-[#6B7D5E] bg-[#768c6e]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Verified Consultation
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#2D3728]/60">{rev.patientDistrict} • {rev.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#2D3728]/85 leading-relaxed">{rev.text}</p>

                    <div className="flex items-center justify-between pt-2 text-[11px] text-[#2D3728]/60">
                      <button
                        onClick={() => voteHelpfulReview(rev.id)}
                        className="inline-flex items-center gap-1 hover:text-[#768c6e] transition-colors"
                      >
                        <ThumbsUp className="w-3 h-3" /> Helpful ({rev.helpfulCount})
                      </button>
                      <span>Confidential Tele-Care</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 6: Specialization Tag Pills */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider mb-2">Clinical Focus Areas</h3>
            <div className="flex flex-wrap gap-2">
              {doctor.specialties.map((spec, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#768c6e]/15 text-[#2D3728] border border-[#768c6e]/20"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section 7: Sticky Footer */}
        <div className="sticky bottom-0 z-20 bg-[#F7F5EF] p-4 sm:p-5 border-t border-[#768c6e]/20 flex items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs text-[#2D3728]/70 block font-medium">Consultation Fee</span>
            <span className="text-xl sm:text-2xl font-extrabold text-[#2D3728] font-mono">
              LKR {doctor.feeLkr.toLocaleString()}
            </span>
          </div>

          <button
            disabled={!selectedSlot}
            onClick={() => {
              if (selectedSlot) onProceedToBook(doctor, selectedSlot);
            }}
            className={`btn-primary ${!selectedSlot ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Proceed to Book Session
          </button>
        </div>
      </div>
    </div>
  );
};
