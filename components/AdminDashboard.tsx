'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePsyNova } from '@/lib/store';
import { DoctorStatus, BoostTier } from '@/lib/types';
import {
  LayoutDashboard,
  Stethoscope,
  Star,
  ShieldAlert,
  CreditCard,
  Settings,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  XCircle,
  Crown,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Lock,
  Search,
  Server,
  Home,
  Video,
  Phone,
  Mail,
  ExternalLink,
  MessageSquare,
  Filter,
  Clock,
} from 'lucide-react';

interface AdminDashboardProps {
  activeSubTab?: string;
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSubTab = 'overview', setActiveTab }) => {
  const {
    psychiatrists,
    bookings,
    reviews,
    complaints,
    platformSettings,
    patients,
    updateDoctorStatus,
    boostPsychiatrist,
    unboostPsychiatrist,
    flagReview,
    resolveComplaint,
    markPayoutPaid,
    cancelBooking,
    completeBooking,
    updatePlatformSettings,
  } = usePsyNova();

  const [currentSubTab, setCurrentSubTab] = useState<string>(activeSubTab);
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('');
  const [patientSearchQuery, setPatientSearchQuery] = useState<string>('');
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>('');
  const [testSmsRecipient, setTestSmsRecipient] = useState<string>('');
  const [smsGatewayInfo, setSmsGatewayInfo] = useState<{
    gateway: string;
    senderId: string;
    hasApiKey: boolean;
    hasUserId: boolean;
    isConfigured: boolean;
    logs: any[];
  } | null>(null);
  const [isTestingSms, setIsTestingSms] = useState(false);
  const [smsTestFeedback, setSmsTestFeedback] = useState<{ success: boolean; message: string; details?: any } | null>(null);

  // Fetch SMS gateway status & logs
  const fetchSmsInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/sms');
      if (res.ok) {
        const data = await res.json();
        setSmsGatewayInfo(data);
      }
    } catch (e) {
      console.warn('Failed to load SMS gateway status:', e);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/sms');
        if (res.ok && isMounted) {
          const data = await res.json();
          setSmsGatewayInfo(data);
        }
      } catch (e) {
        console.warn('Failed to load SMS gateway status:', e);
      }
    };
    loadStatus();
    const interval = setInterval(loadStatus, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Boost action message
  const [boostMsg, setBoostMsg] = useState<string | null>(null);

  // Complaint resolution form modal state
  const [solvingComplaintId, setSolvingComplaintId] = useState<string | null>(null);
  const [proofNote, setProofNote] = useState('');

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 7, 1)); // Aug 2026

  // Admin Nav Links
  const adminLinks = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'All Bookings', icon: CalendarIcon },
    { id: 'users', label: 'Patient Accounts', icon: Users },
    { id: 'psychiatrists', label: 'SLMC & Doctors', icon: Stethoscope },
    { id: 'reviews', label: 'Reviews Audit', icon: Star },
    { id: 'complaints', label: 'Complaints Queue', icon: ShieldAlert },
    { id: 'payments', label: 'Financial Payouts', icon: CreditCard },
    { id: 'calendar', label: 'Admin Calendar', icon: CalendarIcon },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  // Financial Stats
  const totalBookings = bookings.length;
  const totalGrossRevenue = bookings.reduce((sum, b) => sum + b.feeLkr, 0);
  const totalPlatformCommission = bookings.reduce((sum, b) => sum + b.platformCommissionLkr, 0);
  const pendingApprovalsCount = psychiatrists.filter((d) => d.status === 'pending').length;
  const boostedCount = psychiatrists.filter((d) => d.isBoosted).length;

  const handleBoostToggle = (docId: string, isCurrentlyBoosted: boolean) => {
    if (isCurrentlyBoosted) {
      unboostPsychiatrist(docId);
      setBoostMsg('Spotlight boost removed.');
    } else {
      const res = boostPsychiatrist(docId, '3-day');
      setBoostMsg(res.message);
    }
    setTimeout(() => setBoostMsg(null), 3000);
  };

  const handleSolveComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!solvingComplaintId) return;
    resolveComplaint(solvingComplaintId, 'Ref_Proof_Uploaded_PayHere.pdf', proofNote);
    setSolvingComplaintId(null);
    setProofNote('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Shared Admin Header Pattern */}
      <div className="p-6 rounded-[28px] bg-[#768c6e] text-[#F7F5EF] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-0.5 rounded-full">
              System Admin Control
            </span>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <Server className="w-3 h-3" /> Live Server Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            PsyNova Platform Admin Control
          </h1>
          <p className="text-xs sm:text-sm text-[#F7F5EF]/80 mt-0.5">
            Full operational management of SLMC doctor verification, payouts, complaints, and spotlight boosts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('home')}
            className="btn-secondary py-2 px-4 text-xs text-[#F7F5EF] border-white/40 hover:bg-white/10 flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Home Page View
          </button>
        </div>
      </div>

      {/* Admin Navigation Sub-Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#768c6e]/20">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const isActive = currentSubTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentSubTab(link.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-[#768c6e] text-[#F7F5EF] shadow-md'
                  : 'bg-[#F7F5EF] text-[#2D3728]/80 hover:bg-[#768c6e]/15'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {link.label}
              {link.id === 'psychiatrists' && pendingApprovalsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {boostMsg && (
        <div className="p-4 rounded-2xl bg-[#768c6e]/15 border border-[#768c6e]/30 text-xs font-semibold text-[#2D3728]">
          {boostMsg}
        </div>
      )}

      {/* SUB-PAGE 1: OVERVIEW */}
      {currentSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              onClick={() => {
                setSelectedPatientFilter('');
                setCurrentSubTab('bookings');
              }}
              className="psynova-card p-6 space-y-1 cursor-pointer hover:border-[#768c6e] hover:shadow-lg transition-all group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Total Bookings</span>
                <span className="text-[10px] font-bold text-[#768c6e] bg-[#768c6e]/15 px-2 py-0.5 rounded-full group-hover:bg-[#768c6e] group-hover:text-white transition-colors">
                  View All →
                </span>
              </div>
              <p className="text-3xl font-extrabold text-[#2D3728] font-mono group-hover:text-[#6B7D5E] transition-colors">{totalBookings}</p>
              <span className="text-[11px] text-[#2D3728]/70 font-medium">Click to open Bookings & Patient Details</span>
            </div>

            <div className="psynova-card p-6 space-y-1">
              <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Gross Platform Revenue</span>
              <p className="text-3xl font-extrabold text-[#2D3728] font-mono">LKR {totalGrossRevenue.toLocaleString()}</p>
              <span className="text-[11px] text-[#2D3728]/60">PayHere LKR transactions</span>
            </div>

            <div className="psynova-card p-6 space-y-1">
              <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">
                Net Commission Revenue
              </span>
              <p className="text-3xl font-extrabold text-[#6B7D5E] font-mono">
                LKR {totalPlatformCommission.toLocaleString()}
              </p>
              <span className="text-[11px] text-[#2D3728]/60">At {platformSettings.commissionRate}% platform rate</span>
            </div>

            <div className="psynova-card p-6 space-y-1">
              <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Active Boosts</span>
              <p className="text-3xl font-extrabold text-amber-800 font-mono">
                {boostedCount} / {platformSettings.maxBoostedDoctors}
              </p>
              <span className="text-[11px] text-[#2D3728]/60">Strict 9-max enforced</span>
            </div>
          </div>

          {/* Quick Approvals Queue */}
          <div className="p-6 rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 space-y-4">
            <h3 className="font-bold text-lg text-[#2D3728] flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#768c6e]" /> Pending SLMC Doctor Verifications ({pendingApprovalsCount})
            </h3>

            {pendingApprovalsCount === 0 ? (
              <p className="text-xs text-[#2D3728]/70 italic">All practitioner applications are currently verified.</p>
            ) : (
              <div className="space-y-3">
                {psychiatrists
                  .filter((d) => d.status === 'pending')
                  .map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-white border border-[#768c6e]/20 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-bold text-sm text-[#2D3728]">{doc.name}</span>
                        <p className="text-[11px] font-mono text-[#6B7D5E]">
                          SLMC Reg: {doc.slmcRegNo} • {doc.district}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateDoctorStatus(doc.id, 'approved')}
                          className="btn-primary py-1.5 px-3 text-[11px]"
                        >
                          Approve Doctor
                        </button>
                        <button
                          onClick={() => updateDoctorStatus(doc.id, 'suspended')}
                          className="btn-destructive py-1.5 px-3 text-[11px]"
                        >
                          Reject / Suspend
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: PSYCHIATRISTS (SLMC & DOCTORS) */}
      {currentSubTab === 'psychiatrists' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-[#2D3728]">SLMC Registered Psychiatrist Directory</h2>
              <p className="text-xs text-[#2D3728]/70">
                Verify licenses, toggle Spotlight boosting (strictly max {platformSettings.maxBoostedDoctors}), or suspend accounts.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#768c6e]/15 text-[#6B7D5E] px-3.5 py-1.5 rounded-full border border-[#768c6e]/20">
              Crown Boosted: {boostedCount} / {platformSettings.maxBoostedDoctors} Max
            </span>
          </div>

          <div className="rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#768c6e]/10 border-b border-[#768c6e]/20 text-[#6B7D5E] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">SLMC Reg #</th>
                  <th className="p-4">District</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Spotlight Boost</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#768c6e]/15">
                {psychiatrists.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/60 transition-colors">
                    <td className="p-4 font-bold text-[#2D3728]">
                      {doc.name}
                      <span className="block text-[11px] font-normal text-[#2D3728]/70">{doc.title}</span>
                    </td>
                    <td className="p-4 font-mono text-[#6B7D5E] font-semibold">{doc.slmcRegNo}</td>
                    <td className="p-4">{doc.district}</td>
                    <td className="p-4">
                      {doc.status === 'approved' && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                          Approved
                        </span>
                      )}
                      {doc.status === 'pending' && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
                          Pending SLMC
                        </span>
                      )}
                      {doc.status === 'suspended' && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-red-500/15 text-red-800 border border-red-500/30">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {doc.isBoosted ? (
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                          👑 ({doc.boostTier})
                        </span>
                      ) : (
                        <span className="text-xs text-[#2D3728]/50">None</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      {doc.status !== 'approved' ? (
                        <button
                          onClick={() => updateDoctorStatus(doc.id, 'approved')}
                          className="btn-primary text-[11px] py-1 px-3"
                        >
                          Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => updateDoctorStatus(doc.id, 'suspended')}
                          className="btn-destructive text-[11px] py-1 px-3"
                        >
                          Suspend
                        </button>
                      )}

                      <button
                        onClick={() => handleBoostToggle(doc.id, doc.isBoosted)}
                        className={`text-[11px] py-1 px-3 rounded-full font-semibold transition-all border ${
                          doc.isBoosted
                            ? 'border-amber-600 text-amber-800 hover:bg-amber-100'
                            : 'border-[#768c6e] text-[#768c6e] hover:bg-[#768c6e]/10'
                        }`}
                      >
                        {doc.isBoosted ? 'Remove Boost' : '+ Apply Crown Boost'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-PAGE 3: REVIEWS AUDIT */}
      {currentSubTab === 'reviews' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#2D3728]">Reviews Audit & Moderation</h2>
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#768c6e]/20 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#2D3728]">{rev.patientName} → {rev.doctorName}</span>
                  <span className="text-amber-700 font-bold">{rev.rating} ★</span>
                </div>
                <p className="text-[#2D3728]/85">{rev.text}</p>
                {rev.flagged && (
                  <p className="text-red-600 font-semibold">Flagged for review: {rev.adminNote}</p>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => flagReview(rev.id, 'Admin flagged for audit')}
                    className="btn-destructive text-[11px] py-1 px-3"
                  >
                    Flag Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-PAGE 4: COMPLAINTS QUEUE */}
      {currentSubTab === 'complaints' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#2D3728]">Complaints & Refund Resolutions Queue</h2>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="p-5 rounded-2xl bg-[#F7F5EF] border border-[#768c6e]/20 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#2D3728]">{c.id} • {c.reason}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-500/15 text-emerald-800'
                        : 'bg-amber-500/15 text-amber-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[#2D3728]/80">{c.details}</p>
                <div className="text-[11px] text-[#2D3728]/60 font-mono">
                  Patient: {c.patientName} | Doctor: {c.doctorName} | Booking: {c.bookingId}
                </div>

                {c.status === 'Pending' ? (
                  <button
                    onClick={() => setSolvingComplaintId(c.id)}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    Solve Issue & Upload Proof
                  </button>
                ) : (
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                    <strong>Resolved:</strong> {c.resolutionNote} (Proof: {c.resolutionProof})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Solve Complaint */}
      {solvingComplaintId && (
        <div
          onClick={() => setSolvingComplaintId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[#F7F5EF] rounded-[24px] p-6 shadow-2xl space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#2D3728]">Solve Issue & Attach Resolution Proof</h3>
              <button
                onClick={() => setSolvingComplaintId(null)}
                className="p-1 rounded-full hover:bg-[#768c6e]/10 text-[#2D3728]/70"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSolveComplaintSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Resolution Protocol Notes</label>
                <textarea
                  required
                  rows={3}
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="e.g. Issue resolved via full LKR refund to patient bank account."
                  className="w-full px-3 py-2 rounded-xl border border-[#768c6e]/30 bg-white"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-2.5">
                Mark Issue Resolved
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-PAGE 5: FINANCIAL PAYOUTS */}
      {currentSubTab === 'payments' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[#2D3728]">Doctor Financial Session Payouts</h2>
          <div className="rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#768c6e]/10 border-b border-[#768c6e]/20 text-[#6B7D5E] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Booking</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Gross LKR</th>
                  <th className="p-4">Commission ({platformSettings.commissionRate}%)</th>
                  <th className="p-4">Doctor Net</th>
                  <th className="p-4">Payout Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#768c6e]/15">
                {bookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-white/60 transition-colors">
                    <td className="p-4 font-mono font-bold text-[#2D3728]">{bk.id}</td>
                    <td className="p-4 font-semibold text-[#2D3728]">{bk.doctorName}</td>
                    <td className="p-4 font-mono">LKR {bk.feeLkr.toLocaleString()}</td>
                    <td className="p-4 font-mono text-[#6B7D5E]">LKR {bk.platformCommissionLkr.toLocaleString()}</td>
                    <td className="p-4 font-mono font-bold text-[#2D3728]">LKR {bk.netDoctorEarningLkr.toLocaleString()}</td>
                    <td className="p-4">
                      {bk.paymentStatus === 'payout_completed' ? (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800">
                          Disbursed Paid
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800">
                          Pending Disburse
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {bk.paymentStatus !== 'payout_completed' && (
                        <button
                          onClick={() => markPayoutPaid(bk.id)}
                          className="btn-primary text-[11px] py-1 px-3"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-PAGE 6: ADMIN CALENDAR */}
      {currentSubTab === 'calendar' && (
        <div className="space-y-6">
          {/* Admin Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="psynova-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-[#6B7D5E] uppercase tracking-wider">Bookings Today</span>
              <p className="text-2xl font-extrabold text-[#2D3728] font-mono">4 Sessions</p>
            </div>
            <div className="psynova-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-[#6B7D5E] uppercase tracking-wider">Pending Approvals</span>
              <p className="text-2xl font-extrabold text-amber-800 font-mono">{pendingApprovalsCount} Doctors</p>
            </div>
            <div className="psynova-card p-4 space-y-1">
              <span className="text-[11px] font-semibold text-[#6B7D5E] uppercase tracking-wider">Boosted Slots Used</span>
              <p className="text-2xl font-extrabold text-[#768c6e] font-mono">
                {boostedCount} / {platformSettings.maxBoostedDoctors}
              </p>
            </div>
          </div>

          {/* Agenda Panel */}
          <div className="p-5 rounded-2xl bg-[#768c6e]/15 border border-[#768c6e]/25 space-y-3">
            <h3 className="font-bold text-sm text-[#2D3728] uppercase tracking-wider">
              Agenda & Scheduled Platform Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 border border-[#768c6e]/20">
                <span className="font-bold text-[#2D3728] block">Pending Verifications</span>
                <span className="text-[#2D3728]/70">{pendingApprovalsCount} doctor documents due for review</span>
              </div>
              <div className="p-3 rounded-xl bg-white/80 border border-[#768c6e]/20">
                <span className="font-bold text-[#2D3728] block">Scheduled Payouts</span>
                <span className="text-[#2D3728]/70">PayHere settlement cycle on Friday</span>
              </div>
              <div className="p-3 rounded-xl bg-white/80 border border-[#768c6e]/20">
                <span className="font-bold text-[#2D3728] block">Flagged Reviews Audit</span>
                <span className="text-[#2D3728]/70">{reviews.filter((r) => r.flagged).length} flagged entries pending audit</span>
              </div>
            </div>
          </div>

          {/* Month-View Calendar Grid */}
          <div className="p-6 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#2D3728]">August 2026 Platform Overview</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl bg-white border border-[#768c6e]/20 text-[#2D3728]">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold px-3 py-1 bg-[#768c6e] text-[#F7F5EF] rounded-full">Today</span>
                <button className="p-2 rounded-xl bg-white border border-[#768c6e]/20 text-[#2D3728]">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#6B7D5E] border-b border-[#768c6e]/20 pb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-2 text-xs font-mono">
              {[...Array(31)].map((_, i) => {
                const day = i + 1;
                const isToday = day === 14;
                return (
                  <div
                    key={day}
                    className={`min-h-[64px] p-2 rounded-xl border text-left flex flex-col justify-between ${
                      isToday
                        ? 'bg-[#768c6e] text-[#F7F5EF] border-[#768c6e] font-bold shadow-md'
                        : 'bg-white/70 border-[#768c6e]/15 text-[#2D3728]'
                    }`}
                  >
                    <span>{day}</span>
                    {day === 14 && <span className="text-[10px] bg-amber-400 text-amber-950 px-1 rounded">2 Bookings</span>}
                    {day === 15 && <span className="text-[10px] bg-[#768c6e]/20 text-[#2D3728] px-1 rounded">1 Booking</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: ALL BOOKINGS & PATIENT DETAILS */}
      {currentSubTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3728] flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-[#768c6e]" /> All Platform Bookings & Patient Details
              </h2>
              <p className="text-xs text-[#2D3728]/70">
                View all consultation appointments, patient contact information, payment status, and video links.
              </p>
            </div>

            {selectedPatientFilter && (
              <div className="flex items-center gap-2 bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-semibold">
                <span>Filtered for Patient: <strong>{selectedPatientFilter}</strong></span>
                <button
                  onClick={() => setSelectedPatientFilter('')}
                  className="p-1 rounded-full hover:bg-amber-200 text-amber-900 font-bold"
                  title="Clear Patient Filter"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#2D3728]/40" />
              <input
                type="text"
                placeholder="Search by Patient Name, Email, Doctor, Booking ID, or PayHere Ref..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
              />
            </div>
            {selectedPatientFilter && (
              <button
                onClick={() => setSelectedPatientFilter('')}
                className="btn-outline text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                Show All Patients
              </button>
            )}
          </div>

          {/* Bookings List */}
          {(() => {
            const filteredBookings = bookings.filter((b) => {
              const matchesPatient = !selectedPatientFilter || b.patientEmail.toLowerCase() === selectedPatientFilter.toLowerCase() || b.patientName.toLowerCase().includes(selectedPatientFilter.toLowerCase());
              const query = bookingSearchQuery.toLowerCase().trim();
              const matchesQuery = !query ||
                b.id.toLowerCase().includes(query) ||
                b.patientName.toLowerCase().includes(query) ||
                b.patientEmail.toLowerCase().includes(query) ||
                b.patientContact.includes(query) ||
                b.doctorName.toLowerCase().includes(query) ||
                (b.payhereRef && b.payhereRef.toLowerCase().includes(query));

              return matchesPatient && matchesQuery;
            });

            if (filteredBookings.length === 0) {
              return (
                <div className="p-8 text-center bg-[#F7F5EF] rounded-2xl border border-[#768c6e]/20 space-y-3">
                  <p className="text-sm font-semibold text-[#2D3728]">No bookings found matching criteria.</p>
                  <p className="text-xs text-[#2D3728]/60">Try clearing filters or search query.</p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-semibold text-[#2D3728]/80 px-1">
                  <span>Showing {filteredBookings.length} booking(s)</span>
                  <span className="font-mono text-[#6B7D5E]">
                    Total Value: LKR {filteredBookings.reduce((sum, b) => sum + b.feeLkr, 0).toLocaleString()}
                  </span>
                </div>

                {filteredBookings.map((b) => {
                  const doc = psychiatrists.find((d) => d.id === b.doctorId);
                  const dateObj = new Date(b.slotDatetime);
                  const formattedDate = dateObj.toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={b.id}
                      className="p-5 sm:p-6 rounded-2xl bg-[#F7F5EF] border border-[#768c6e]/20 space-y-4 shadow-sm hover:border-[#768c6e]/50 transition-all"
                    >
                      {/* Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#768c6e]/15">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-[#2D3728]">{b.id}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : b.status === 'completed'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : b.status === 'cancelled'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {b.status}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : b.paymentStatus === 'payout_completed'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            PayHere: {b.paymentStatus}
                          </span>
                        </div>
                        <div className="text-xs text-[#2D3728]/70 font-medium flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#768c6e]" />
                          <span>{formattedDate} at {formattedTime}</span>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Patient Details */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#768c6e]/15 space-y-1.5">
                          <div className="flex justify-between items-center border-b border-[#768c6e]/10 pb-1">
                            <span className="font-bold text-[#6B7D5E] uppercase text-[10px]">Registered Patient Details</span>
                            <span className="font-mono text-[10px] text-[#2D3728]/60">{b.patientId || 'PN-PAT-88421'}</span>
                          </div>
                          <p className="font-bold text-sm text-[#2D3728]">{b.patientName}</p>
                          <div className="text-[#2D3728]/80 space-y-0.5">
                            <p className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#768c6e]" /> {b.patientEmail}
                            </p>
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#768c6e]" /> {b.patientContact}
                            </p>
                          </div>
                        </div>

                        {/* Psychiatrist Details */}
                        <div className="p-3.5 rounded-xl bg-white border border-[#768c6e]/15 space-y-1.5">
                          <div className="flex justify-between items-center border-b border-[#768c6e]/10 pb-1">
                            <span className="font-bold text-[#6B7D5E] uppercase text-[10px]">SLMC Practitioner</span>
                            <span className="font-mono text-[10px] text-[#2D3728]/60">{doc?.slmcRegNo || 'SLMC Verified'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc?.photo && (
                              <img src={doc.photo} alt={doc.name} className="w-7 h-7 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-bold text-sm text-[#2D3728]">{b.doctorName}</p>
                              <p className="text-[10px] text-[#2D3728]/70">{doc?.title || 'Consultant Psychiatrist'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financial & Telehealth Row */}
                      <div className="p-3.5 rounded-xl bg-white/60 border border-[#768c6e]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-[#2D3728]">
                            Session Fee: <span className="font-mono font-bold text-[#6B7D5E]">LKR {b.feeLkr.toLocaleString()}</span>
                          </p>
                          <p className="text-[10px] text-[#2D3728]/70 font-mono">
                            Commission ({platformSettings.commissionRate}%): LKR {b.platformCommissionLkr.toLocaleString()} | Earning: LKR {b.netDoctorEarningLkr.toLocaleString()}
                          </p>
                          {b.payhereRef && (
                            <p className="text-[10px] text-[#2D3728]/60 font-mono">
                              PayHere Gateway Ref: {b.payhereRef}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                          {b.videoLink && (
                            <a
                              href={b.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-[#768c6e] text-white font-bold text-[11px] flex items-center gap-1.5 hover:bg-[#2D3728] transition-colors"
                            >
                              <Video className="w-3.5 h-3.5" /> Join Telehealth Room
                            </a>
                          )}

                          {b.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => completeBooking(b.id)}
                                className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px] transition-colors"
                              >
                                Complete Session
                              </button>
                              <button
                                onClick={() => cancelBooking(b.id, 'Cancelled by platform admin')}
                                className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] transition-colors"
                              >
                                Cancel Session
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* SUB-PAGE 7: PATIENT ACCOUNTS */}
      {currentSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#2D3728] flex items-center gap-2">
                <Users className="w-5 h-5 text-[#768c6e]" /> Registered Patient Accounts ({patients.length})
              </h2>
              <p className="text-xs text-[#2D3728]/70">
                All patient profiles registered on PsyNova, including active account statuses and booking metrics.
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#2D3728]/40" />
            <input
              type="text"
              placeholder="Search patients by name, email, mobile, client ID or district..."
              value={patientSearchQuery}
              onChange={(e) => setPatientSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
            />
          </div>

          {/* Patients List Grid */}
          <div className="space-y-3">
            {(() => {
              const query = patientSearchQuery.toLowerCase().trim();
              const filteredPatients = patients.filter(
                (p) =>
                  !query ||
                  p.name.toLowerCase().includes(query) ||
                  p.email.toLowerCase().includes(query) ||
                  p.phone.includes(query) ||
                  p.clientId.toLowerCase().includes(query) ||
                  p.district.toLowerCase().includes(query)
              );

              if (filteredPatients.length === 0) {
                return (
                  <div className="p-8 text-center bg-[#F7F5EF] rounded-2xl border border-[#768c6e]/20 space-y-2">
                    <p className="text-sm font-semibold text-[#2D3728]">No patient accounts found.</p>
                  </div>
                );
              }

              return filteredPatients.map((pat) => {
                const patientBookings = bookings.filter(
                  (b) => b.patientEmail.toLowerCase() === pat.email.toLowerCase() || b.patientName.toLowerCase() === pat.name.toLowerCase()
                );

                return (
                  <div
                    key={pat.id}
                    className="p-5 rounded-2xl bg-[#F7F5EF] border border-[#768c6e]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs hover:border-[#768c6e]/40 transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2D3728]">{pat.name}</span>
                        <span className="font-mono text-[11px] bg-[#768c6e]/20 px-2 py-0.5 rounded text-[#2D3728]">
                          {pat.clientId}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          {pat.status}
                        </span>
                      </div>
                      <p className="text-[#2D3728]/80 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#768c6e]" /> {pat.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#768c6e]" /> {pat.phone}
                        </span>
                        <span>District: <strong>{pat.district}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] font-semibold text-[#6B7D5E] uppercase">Total Bookings</p>
                        <p className="text-base font-extrabold text-[#2D3728] font-mono">{patientBookings.length}</p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPatientFilter(pat.email);
                          setCurrentSubTab('bookings');
                        }}
                        className="btn-primary text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" /> View Bookings ({patientBookings.length})
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* SUB-PAGE 8: PLATFORM SETTINGS */}
      {currentSubTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-6">
            <h2 className="text-xl font-bold text-[#2D3728]">Platform Operational Parameters</h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">
                  Platform Commission Rate ({platformSettings.commissionRate}%) [Range: 10% - 25%]
                </label>
                <input
                  type="range"
                  min={10}
                  max={25}
                  value={platformSettings.commissionRate}
                  onChange={(e) => updatePlatformSettings({ commissionRate: Number(e.target.value) })}
                  className="w-full accent-[#768c6e]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">
                  Maximum Boosted Doctors Allowed Platform-Wide ({platformSettings.maxBoostedDoctors} Max)
                </label>
                <input
                  type="number"
                  min={3}
                  max={9}
                  value={platformSettings.maxBoostedDoctors}
                  onChange={(e) => updatePlatformSettings({ maxBoostedDoctors: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white"
                />
                <p className="text-[11px] text-[#2D3728]/60 mt-1">Strictly capped at max 9 spotlight slots.</p>
              </div>

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">
                  Hero Section Background Image (Database / Media URL)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={platformSettings.heroImageUrl || '/hero_bg.jpg'}
                    onChange={(e) => updatePlatformSettings({ heroImageUrl: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl border border-[#768c6e]/30 bg-white text-xs font-mono"
                    placeholder="/hero_bg.jpg or custom image URL"
                  />
                  <button
                    type="button"
                    onClick={() => updatePlatformSettings({ heroImageUrl: '/hero_bg.jpg' })}
                    className="btn-secondary text-[11px] py-2 px-3 shrink-0"
                  >
                    Reset to Mindfulness Photography
                  </button>
                </div>
                <p className="text-[11px] text-[#2D3728]/60 mt-1">
                  Saved directly to database and loaded dynamically across the home mindfulness showcase.
                </p>
              </div>
            </div>
          </div>

          {/* PayHere & Notify.lk Gateway Card */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-[#768c6e]/15 pb-3">
              <div>
                <h2 className="text-xl font-bold text-[#2D3728]">PayHere & Notify.lk Status</h2>
                <p className="text-xs text-[#2D3728]/70">Sri Lanka local Payment & Telco Gateway integrations</p>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 font-bold">
                Active
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-[#768c6e]/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#2D3728]">
                  <span>PayHere Gateway (LKR)</span>
                  <span className="font-mono text-[#6B7D5E]">Merchant: 1224892</span>
                </div>
                <p className="text-[#2D3728]/70">
                  Mode: <strong className="font-mono text-[#2D3728]">Sandbox & Live MD5 Hash Verification</strong>. Supports Visa/Master, eZ Cash, mCash, Sampath Vishwa.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#768c6e]/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-[#2D3728]">
                  <div className="flex items-center gap-2">
                    <span>Notify.lk Sri Lanka SMS Gateway</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      smsGatewayInfo?.isConfigured
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {smsGatewayInfo?.isConfigured ? 'Live Credentials Connected' : 'Simulated Gateway Mode'}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#6B7D5E]">
                    Sender ID: <strong>{smsGatewayInfo?.senderId || 'NotifyDEMO'}</strong>
                  </span>
                </div>

                <p className="text-[#2D3728]/70 text-xs">
                  Automated appointment dispatch & Jitsi video consultation reminders sent to customer booking phone numbers (<strong className="font-mono">+94 7X XXX XXXX</strong>).
                </p>

                {/* Gateway credentials checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-[#F7F5EF] border border-[#768c6e]/20">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${smsGatewayInfo?.hasUserId ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span>User ID (<code className="font-mono">NOTIFYLK_USER_ID</code>): {smsGatewayInfo?.hasUserId ? 'Configured' : 'Not Set (Set in environment)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${smsGatewayInfo?.hasApiKey ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <span>API Key (<code className="font-mono">NOTIFYLK_API_KEY</code>): {smsGatewayInfo?.hasApiKey ? 'Configured' : 'Not Set (Set in environment)'}</span>
                  </div>
                </div>

                {/* Live Diagnostic SMS Dispatch Tester */}
                <div className="space-y-2 pt-2 border-t border-[#768c6e]/15">
                  <label className="text-[11px] font-semibold text-[#2D3728]/80 block">
                    Diagnostic SMS Dispatch Tester
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="tel"
                      value={testSmsRecipient}
                      onChange={(e) => setTestSmsRecipient(e.target.value)}
                      placeholder="e.g. +94771234567 or 0771234567"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#768c6e]/30 bg-white text-xs font-mono text-[#2D3728]"
                    />
                    {bookings.length > 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) setTestSmsRecipient(e.target.value);
                        }}
                        className="px-2 py-1.5 rounded-xl border border-[#768c6e]/30 bg-white text-xs text-[#2D3728]"
                      >
                        <option value="">Select Booked Customer...</option>
                        {bookings.map((bk) => (
                          <option key={bk.id} value={bk.patientContact}>
                            {bk.patientName} ({bk.patientContact}) - {bk.id}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      disabled={isTestingSms}
                      onClick={async () => {
                        const target = testSmsRecipient.trim() || (bookings[0]?.patientContact || '').trim();
                        if (!target) {
                          setSmsTestFeedback({
                            success: false,
                            message: 'Please enter or select a recipient mobile number (e.g. 077 123 4567 or +94 77 123 4567) to test.',
                          });
                          return;
                        }
                        setIsTestingSms(true);
                        setSmsTestFeedback(null);
                        try {
                          const res = await fetch('/api/sms', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'test', recipient: target }),
                          });
                          const data = await res.json();
                          fetchSmsInfo();
                          if (data.status === 'DELIVERED') {
                            setSmsTestFeedback({
                              success: true,
                              message: `SMS successfully delivered to ${data.log?.formattedRecipient || target} via Notify.lk telco gateway! (Ref: ${data.messageId})`,
                              details: data,
                            });
                          } else if (data.status === 'SIMULATED') {
                            setSmsTestFeedback({
                              success: true,
                              message: `Simulated SMS dispatched to ${data.log?.formattedRecipient || target}. (Note: Add NOTIFYLK_USER_ID and NOTIFYLK_API_KEY in environment variables to deliver live carrier SMS).`,
                              details: data,
                            });
                          } else {
                            setSmsTestFeedback({
                              success: false,
                              message: `Notify.lk Gateway reported: ${data.error || data.log?.errorNote || 'Dispatch failed'}`,
                              details: data,
                            });
                          }
                        } catch (e: any) {
                          setSmsTestFeedback({
                            success: false,
                            message: 'Network error calling SMS gateway: ' + e.message,
                          });
                        } finally {
                          setIsTestingSms(false);
                        }
                      }}
                      className="btn-secondary text-[11px] py-1.5 px-3 shrink-0 flex items-center justify-center gap-1.5"
                    >
                      {isTestingSms ? 'Dispatching...' : 'Run Notify.lk Test'}
                    </button>
                  </div>

                  {/* Feedback Box */}
                  {smsTestFeedback && (
                    <div className={`mt-2 p-3 rounded-xl text-xs flex items-start gap-2 ${
                      smsTestFeedback.success
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-50 text-rose-900 border border-rose-300'
                    }`}>
                      <span className="font-bold">{smsTestFeedback.success ? '✓' : '⚠️'}</span>
                      <div className="flex-1">
                        <p>{smsTestFeedback.message}</p>
                        {smsTestFeedback.details?.log?.errorNote && (
                          <p className="font-mono text-[10px] mt-1 opacity-80">{smsTestFeedback.details.log.errorNote}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent SMS Dispatch Logs */}
                <div className="pt-3 border-t border-[#768c6e]/15">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#2D3728] uppercase tracking-wider">
                      Recent Notify.lk SMS Logs ({smsGatewayInfo?.logs?.length || 0})
                    </span>
                    <button
                      onClick={fetchSmsInfo}
                      className="text-[10px] font-mono text-[#6B7D5E] hover:underline"
                    >
                      Refresh Logs
                    </button>
                  </div>

                  {smsGatewayInfo?.logs && smsGatewayInfo.logs.length > 0 ? (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {smsGatewayInfo.logs.slice(0, 10).map((log: any) => (
                        <div
                          key={log.id}
                          className="p-2.5 rounded-xl bg-[#F7F5EF] border border-[#768c6e]/15 text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-[#2D3728]">
                              {log.formattedRecipient || log.recipient}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                              log.status === 'DELIVERED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : log.status === 'SIMULATED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-[#2D3728]/80 text-[10px] line-clamp-2">{log.message}</p>
                          <div className="flex items-center justify-between text-[9px] text-[#2D3728]/60 font-mono pt-1 border-t border-[#768c6e]/10">
                            <span>Ref: {log.id} (Sender: {log.senderId})</span>
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                          </div>
                          {log.errorNote && (
                            <p className="text-[9px] font-mono text-rose-700 bg-rose-50 p-1 rounded">
                              {log.errorNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#2D3728]/50 italic">No SMS dispatches recorded yet in this session.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
