'use client';

import React, { useState } from 'react';
import { usePsyNova } from '@/lib/store';
import { Booking } from '@/lib/types';
import { JitsiVideoModal } from '@/components/JitsiVideoModal';
import {
  UserCheck,
  Calendar,
  Video,
  AlertTriangle,
  MessageSquare,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  X
} from 'lucide-react';

interface PatientDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ setActiveTab }) => {
  const { user, bookings, addComplaint, deactivatePatientAccount, addReview } = usePsyNova();

  // Filter bookings belonging to current patient
  const myBookings = bookings.filter((b) => b.patientId === user.id || b.patientEmail === user.email);

  // Modal states for Complaint submission & Review submission
  const [complaintBooking, setComplaintBooking] = useState<Booking | null>(null);
  const [complaintReason, setComplaintReason] = useState('');
  const [complaintDetails, setComplaintDetails] = useState('');
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Jitsi Video Modal State
  const [activeJitsiBooking, setActiveJitsiBooking] = useState<Booking | null>(null);

  // Deactivation confirmation modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintBooking) return;
    addComplaint(complaintBooking.id, complaintReason, complaintDetails);
    setComplaintSubmitted(true);
    setTimeout(() => {
      setComplaintSubmitted(false);
      setComplaintBooking(null);
      setComplaintReason('');
      setComplaintDetails('');
    }, 1800);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    addReview(reviewBooking.doctorId, reviewRating, reviewText);
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewBooking(null);
      setReviewText('');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#768c6e]/20 text-[#768c6e] flex items-center justify-center font-bold">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#2D3728]">{user.name}</h1>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#768c6e]/15 text-[#6B7D5E]">
                Client ID: {user.clientId || 'Unassigned'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#2D3728]/70 mt-0.5">{user.email} • Private Patient Portal</p>
          </div>
        </div>

        {/* Deactivate Button */}
        <button
          onClick={() => setShowDeactivateModal(true)}
          className="btn-destructive text-xs py-2 px-4 whitespace-nowrap"
        >
          Deactivate Account
        </button>
      </div>

      {user.deactivatedAt && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Account Deactivation Hold Active (7-day holding period). Your account will be removed permanently after 7 days unless cancelled.</span>
        </div>
      )}

      {/* Consultations Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#2D3728]">Your Telehealth Consultations</h2>
          <button
            onClick={() => setActiveTab('psychiatrists')}
            className="btn-primary text-xs py-2 px-4"
          >
            + Book New Consultation
          </button>
        </div>

        {myBookings.length === 0 ? (
          <div className="p-12 text-center rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 space-y-4">
            <Calendar className="w-12 h-12 text-[#768c6e] mx-auto opacity-60" />
            <h3 className="text-base font-bold text-[#2D3728]">No Upcoming or Past Consultations</h3>
            <p className="text-xs text-[#2D3728]/70 max-w-sm mx-auto">
              You haven’t booked any sessions yet. Browse our SLMC-verified specialists to schedule your private video consultation.
            </p>
            <button
              onClick={() => setActiveTab('psychiatrists')}
              className="btn-primary text-xs"
            >
              Find a Psychiatrist
            </button>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#768c6e]/10 border-b border-[#768c6e]/20 text-[#6B7D5E] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Psychiatrist</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Fee Paid</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#768c6e]/15">
                {myBookings.map((bk) => {
                  const dateObj = new Date(bk.slotDatetime);
                  return (
                    <tr key={bk.id} className="hover:bg-white/60 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#2D3728]">{bk.id}</td>
                      <td className="p-4 font-medium text-[#2D3728]">{bk.doctorName}</td>
                      <td className="p-4 text-[#2D3728]/80 font-mono">
                        {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                        {dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-mono font-bold text-[#2D3728]">LKR {bk.feeLkr.toLocaleString()}</td>
                      <td className="p-4">
                        {bk.status === 'confirmed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </span>
                        )}
                        {bk.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-800 border border-blue-500/30">
                            Completed
                          </span>
                        )}
                        {bk.status === 'cancelled' && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-800 border border-red-500/30">
                            Cancelled
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        {bk.status === 'confirmed' && (
                          <button
                            onClick={() => setActiveJitsiBooking(bk)}
                            className="btn-primary text-[11px] py-1.5 px-3 inline-flex items-center gap-1 shadow-sm"
                          >
                            <Video className="w-3.5 h-3.5" /> Join Jitsi Video Session
                          </button>
                        )}

                        {bk.status === 'completed' && (
                          <button
                            onClick={() => setReviewBooking(bk)}
                            className="btn-secondary text-[11px] py-1.5 px-3"
                          >
                            Leave Feedback
                          </button>
                        )}

                        <button
                          onClick={() => setComplaintBooking(bk)}
                          className="text-xs text-[#D9635A] hover:underline font-medium"
                        >
                          Report Issue / Refund
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Report Issue / Refund */}
      {complaintBooking && (
        <div
          onClick={() => setComplaintBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F7F5EF] rounded-[24px] p-6 shadow-2xl border border-[#768c6e]/20 space-y-4 animate-scale-up"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#768c6e]/15">
              <h3 className="font-bold text-lg text-[#2D3728]">Report Issue / Request Refund</h3>
              <button onClick={() => setComplaintBooking(null)} className="p-1 text-[#2D3728]/70 hover:bg-[#768c6e]/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="p-4 text-center text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#768c6e] mx-auto" />
                <p className="font-bold text-sm text-[#2D3728]">Complaint Submitted to Administration Queue</p>
                <p className="text-[#2D3728]/70">Our admin desk will review your submission and issue proof of resolution.</p>
              </div>
            ) : (
              <form onSubmit={handleComplaintSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Booking ID</label>
                  <input type="text" disabled value={complaintBooking.id} className="w-full px-3 py-2 rounded-xl bg-gray-200 text-[#2D3728] font-mono" />
                </div>
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Issue Category</label>
                  <select
                    required
                    value={complaintReason}
                    onChange={(e) => setComplaintReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white"
                  >
                    <option value="">Select reason...</option>
                    <option value="Audio / Video Connection Drop">Audio / Video Connection Drop</option>
                    <option value="Doctor No-Show">Doctor No-Show</option>
                    <option value="Incorrect Fee Billing">Incorrect Fee Billing</option>
                    <option value="Other Technical Disruption">Other Technical Disruption</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Details & Refund Request Notes</label>
                  <textarea
                    required
                    rows={3}
                    value={complaintDetails}
                    onChange={(e) => setComplaintDetails(e.target.value)}
                    placeholder="Describe what happened during your consultation..."
                    className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white"
                  />
                </div>
                <button type="submit" className="btn-destructive w-full py-2.5 text-xs font-semibold">
                  Submit Complaint to Admin Desk
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Leave Feedback */}
      {reviewBooking && (
        <div
          onClick={() => setReviewBooking(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F7F5EF] rounded-[24px] p-6 shadow-2xl border border-[#768c6e]/20 space-y-4 animate-scale-up"
          >
            <div className="flex justify-between items-center pb-3 border-b border-[#768c6e]/15">
              <h3 className="font-bold text-lg text-[#2D3728]">Leave Consultation Review</h3>
              <button onClick={() => setReviewBooking(null)} className="p-1 text-[#2D3728]/70 hover:bg-[#768c6e]/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="p-4 text-center text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#768c6e] mx-auto" />
                <p className="font-bold text-sm text-[#2D3728]">Thank You for Your Feedback</p>
                <p className="text-[#2D3728]/70">Your review is now published with a &quot;Verified Consultation&quot; badge.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Rating (Stars)</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white font-bold text-amber-700"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional Care)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Poor)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Unsatisfactory)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Public Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this psychiatrist..."
                    className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white"
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-xs font-semibold">
                  Publish Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Deactivation Modal */}
      {showDeactivateModal && (
        <div
          onClick={() => setShowDeactivateModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F7F5EF] rounded-[24px] p-6 shadow-2xl border border-[#D9635A]/30 space-y-4 animate-scale-up"
          >
            <h3 className="font-bold text-lg text-[#D9635A] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Confirm Account Deactivation
            </h3>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Deactivating your account will place your patient profile on a <strong>7-day holding period</strong>. During this window, you can reactivate anytime by signing in. After 7 days, your stored data will be permanently wiped.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  deactivatePatientAccount();
                  setShowDeactivateModal(false);
                }}
                className="btn-destructive flex-1 text-xs"
              >
                Yes, Initiate Deactivation
              </button>
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="btn-secondary flex-1 text-xs text-[#2D3728]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jitsi Telehealth Video Modal */}
      <JitsiVideoModal
        booking={activeJitsiBooking}
        isOpen={!!activeJitsiBooking}
        onClose={() => setActiveJitsiBooking(null)}
      />
    </div>
  );
};
