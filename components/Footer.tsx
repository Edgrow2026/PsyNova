'use client';

import React from 'react';
import { Stethoscope, ShieldCheck, PhoneCall, Heart } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="w-full bg-[#768c6e] text-[#F7F5EF] pt-16 pb-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#F7F5EF] text-[#768c6e] flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PsyNova</span>
            </div>
            <p className="text-sm text-[#F7F5EF]/85 max-w-md leading-relaxed">
              Connecting individuals across Sri Lanka with SLMC-verified psychiatrists for compassionate, confidential tele-consultations in Sinhala, Tamil, and English.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#F7F5EF]/90 font-mono bg-white/10 px-3.5 py-1.5 rounded-full w-fit border border-white/20">
              <ShieldCheck className="w-4 h-4 text-[#F7F5EF]" /> SLMC Verified Practitioners Only
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F5EF]/80 mb-4">Platform Pages</h4>
            <ul className="space-y-2.5 text-sm text-[#F7F5EF]/90">
              <li>
                <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">
                  Home & Care Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('psychiatrists')} className="hover:text-white transition-colors">
                  Find a Psychiatrist
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('reviews')} className="hover:text-white transition-colors">
                  Patient Experiences & Reviews
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('support')} className="hover:text-white transition-colors">
                  Patient Support & FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Helpline & Crisis Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F7F5EF]/80 mb-4">Immediate Support</h4>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-2 text-xs">
              <p className="font-semibold text-white">National Mental Health Helpline</p>
              <p className="text-[#F7F5EF]/80 leading-snug">Available 24/7 across Sri Lanka, confidential and toll-free.</p>
              <a
                href="tel:1926"
                className="inline-flex items-center gap-1.5 font-bold text-[#F7F5EF] hover:underline pt-1"
              >
                <PhoneCall className="w-3.5 h-3.5" /> Call 1926
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F7F5EF]/70">
          <p>© {new Date().getFullYear()} PsyNova Telehealth Sri Lanka. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Privacy & ID Anonymity Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">SLMC Telehealth Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
