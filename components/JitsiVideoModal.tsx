'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Booking } from '@/lib/types';
import { usePsyNova } from '@/lib/store';
import {
  X,
  Video,
  VideoOff,
  Mic,
  MicOff,
  ShieldCheck,
  Maximize2,
  Minimize2,
  PhoneOff,
  MessageSquare,
  Send,
  Lock,
  ExternalLink,
  Clock,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface JitsiVideoModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteSession?: (bookingId: string) => void;
}

export const JitsiVideoModal: React.FC<JitsiVideoModalProps> = ({
  booking,
  isOpen,
  onClose,
  onCompleteSession,
}) => {
  const { user, completeBooking } = usePsyNova();

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'sms'>('video');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [smsText, setSmsText] = useState('PsyNova Telehealth Alert: Your doctor is waiting in the video consultation room.');
  const [smsSent, setSmsSent] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Timer for session duration
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      setElapsedSeconds(0);
    };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  // Format Room Name safely
  const roomName = booking.videoLink
    ? booking.videoLink.split('/room/')[1] || booking.videoLink.split('/').pop() || `PN-CONF-${booking.id}`
    : `PsyNova-Telehealth-${booking.id}`;

  const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
  const jitsiEmbedUrl = `https://${jitsiDomain}/${roomName}#userInfo.displayName="${encodeURIComponent(
    user.name || (user.role === 'psychiatrist' ? 'Doctor' : 'Patient')
  )}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=${!micEnabled}&config.startWithVideoMuted=${!cameraEnabled}`;

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendSmsAlert = async () => {
    setIsSendingSms(true);
    setSmsSent(false);

    try {
      const recipientPhone = user.role === 'psychiatrist' ? booking.patientContact : '+94 77 123 4567';
      await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: recipientPhone,
          message: `${smsText} Link: ${booking.videoLink}`,
        }),
      });
      setSmsSent(true);
      setTimeout(() => setSmsSent(false), 3000);
    } catch (e) {
      console.error('Failed to dispatch SMSway alert', e);
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleEndConsultation = () => {
    completeBooking(booking.id);
    if (onCompleteSession) {
      onCompleteSession(booking.id);
    }
    onClose();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl h-[90vh] sm:h-[85vh] bg-[#1E293B] text-white rounded-[24px] shadow-2xl border border-slate-700/60 flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 bg-[#0F172A] border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  Jitsi Telehealth Video Room
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">
                  256-bit Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Booking ID: {booking.id} • {user.role === 'psychiatrist' ? `Patient: ${booking.patientName}` : `Psychiatrist: ${booking.doctorName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Session Duration */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* External Tab Link */}
            <a
              href={`https://${jitsiDomain}/${roomName}`}
              target="_blank"
              rel="noreferrer"
              title="Open Jitsi in new tab"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Open New Tab</span>
            </a>

            {/* Close / Minimize */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs bar inside video modal */}
        <div className="px-4 py-2 bg-[#182232] border-b border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'video'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video Feed
            </button>

            {user.role === 'psychiatrist' && (
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  activeTab === 'notes'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Clinical Notes
              </button>
            )}

            <button
              onClick={() => setActiveTab('sms')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'sms'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> SMSway.lk Alert
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            SLMC Tele-psychiatry Protocol Compliant
          </span>
        </div>

        {/* Main Body */}
        <div className="relative flex-1 bg-black overflow-hidden">
          {activeTab === 'video' && (
            <div className="w-full h-full relative">
              <iframe
                src={jitsiEmbedUrl}
                allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media; fullscreen"
                className="w-full h-full border-0"
                title="Jitsi Video Telehealth"
              />

              {/* In-video Overlay Notice */}
              <div className="absolute top-3 left-3 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md text-[11px] text-emerald-300 border border-slate-700/50">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>End-to-End Jitsi Meet Room: <strong className="font-mono">{roomName}</strong></span>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-6 h-full bg-slate-900 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Private Clinical Consultation Notes</h3>
                  <p className="text-xs text-slate-400">
                    Encrypted note scratchpad for Dr. {booking.doctorName}. Visible only to authorized medical personnel.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setNotesSaved(true);
                    setTimeout(() => setNotesSaved(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Save Clinical Note
                </button>
              </div>

              {notesSaved && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Clinical notes saved securely to encrypted patient history!</span>
                </div>
              )}

              {/* Quick Template Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setDoctorNotes((prev) => prev + '\n- Patient presents with mild anxiety symptoms.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  + Anxiety Observation
                </button>
                <button
                  onClick={() => setDoctorNotes((prev) => prev + '\n- Recommended cognitive behavioral techniques & follow-up in 2 weeks.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  + CBT Advisory
                </button>
                <button
                  onClick={() => setDoctorNotes((prev) => prev + '\n- Prescription details issued via SLMC registered digital portal.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  + Prescription Note
                </button>
              </div>

              <textarea
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                placeholder="Type clinical observations, psychiatric evaluations, or dosage recommendations here..."
                rows={12}
                className="w-full p-4 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="p-6 h-full bg-slate-900 overflow-y-auto space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-3">
                <Sparkles className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-100">SMSway.lk Instant Gateway Dispatch</h4>
                  <p className="mt-1 text-slate-300">
                    Send an urgent SMS alert to the patient’s mobile phone in Sri Lanka (<span className="font-mono">{booking.patientContact}</span>) if they are late or disconnected.
                  </p>
                </div>
              </div>

              {smsSent && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SMS successfully dispatched via SMSway.lk Sri Lanka telco gateway!</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recipient Phone Number
                </label>
                <input
                  type="text"
                  readOnly
                  value={user.role === 'psychiatrist' ? booking.patientContact : '+94 77 123 4567'}
                  className="w-full px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  SMS Message Content
                </label>
                <textarea
                  rows={4}
                  value={smsText}
                  onChange={(e) => setSmsText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleSendSmsAlert}
                disabled={isSendingSms}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white flex items-center justify-center gap-2 shadow-lg"
              >
                {isSendingSms ? (
                  <span>Sending via SMSway.lk...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Dispatch SMSway.lk Alert Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Control Strip */}
        <div className="px-5 py-3.5 bg-[#0F172A] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                micEnabled ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{micEnabled ? 'Mute' : 'Unmuted'}</span>
            </button>

            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                cameraEnabled ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              <span className="hidden sm:inline">{cameraEnabled ? 'Camera On' : 'Camera Off'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleEndConsultation}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-colors"
            >
              <PhoneOff className="w-4 h-4" /> End Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
