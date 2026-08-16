'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  PhoneCall,
  MessageSquare
} from 'lucide-react';

interface AboutAndSupportViewProps {
  initialTab?: 'about' | 'support';
}

export const AboutAndSupportView: React.FC<AboutAndSupportViewProps> = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [supportMessageSent, setSupportMessageSent] = useState(false);

  const faqs = [
    {
      q: 'How does PsyNova verify psychiatrist credentials?',
      a: 'Every psychiatrist must hold an active registration with the Sri Lanka Medical Council (SLMC) and complete credential checking before being approved to consult on the platform.',
    },
    {
      q: 'How does PayHere payment and session confirmation work?',
      a: 'When booking, session fees are securely processed in LKR using PayHere MD5 hash verification. Once verified, instant confirmation SMS notifications are dispatched via SMSway.lk.',
    },
    {
      q: 'Is my identity and consultation private?',
      a: 'Yes. PsyNova guarantees strict identity anonymity. Your session takes place inside an encrypted video room, and your personal data is never shared with third parties.',
    },
    {
      q: 'What should I do if I am experiencing an acute crisis?',
      a: 'PsyNova is an outpatient tele-consultation service. If you are in immediate danger or severe crisis, please call the Sri Lanka National Mental Health Helpline on 1926 immediately.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7D5E] bg-[#768c6e]/15 px-3.5 py-1 rounded-full">
          Patient Helpdesk & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D3728]">
          How Can We Help You Today?
        </h1>
        <p className="text-sm sm:text-base text-[#2D3728]/80 leading-relaxed">
          Find answers to common questions regarding SLMC-verified tele-consultations, LKR payments, and identity privacy, or send a direct inquiry to our support team.
        </p>
      </div>

      {/* Support Content */}
      <div className="space-y-12">
        {/* FAQ Section */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#2D3728]">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-[#2D3728]/70">Common questions regarding consultations, payments, and privacy.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#F7F5EF] border border-[#768c6e]/20 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm sm:text-base text-[#2D3728]"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-[#768c6e]" /> : <ChevronDown className="w-5 h-5 text-[#768c6e]" />}
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-[#2D3728]/80 leading-relaxed border-t border-[#768c6e]/15 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md">
          <h3 className="text-xl font-bold text-[#2D3728] mb-2">Patient Helpdesk Inquiry</h3>
          <p className="text-xs text-[#2D3728]/70 mb-6">
            Our team responds to inquiries within 2 hours. Notification updates are sent via SMSway.lk.
          </p>

          {supportMessageSent ? (
            <div className="p-6 rounded-2xl bg-[#768c6e]/15 border border-[#768c6e]/30 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#768c6e] mx-auto" />
              <h4 className="font-bold text-sm text-[#2D3728]">Inquiry Received</h4>
              <p className="text-xs text-[#2D3728]/80">Our support desk will get in touch shortly via email and SMS.</p>
              <button
                onClick={() => setSupportMessageSent(false)}
                className="btn-secondary text-xs mt-2"
              >
                Submit Another Question
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSupportMessageSent(true);
              }}
              className="space-y-4 text-xs sm:text-sm"
            >
              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Dilshan Silva"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">Email or Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 000 0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">How can we assist you?</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your inquiry or technical question..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold">
                <Send className="w-4 h-4" /> Send Helpdesk Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
