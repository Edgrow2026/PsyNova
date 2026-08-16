'use client';

import React from 'react';
import { PhoneCall, ShieldAlert } from 'lucide-react';

export const CrisisBand: React.FC = () => {
  return (
    <div className="w-full bg-[#D9635A] text-[#F7F5EF] py-3.5 px-4 sm:px-8 border-t border-b border-red-400/30 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <p className="text-sm font-medium leading-tight">
            <span className="font-semibold text-white">Emergency Notice:</span> PsyNova is not an emergency medical service. If you or someone you know is in immediate distress, please call the National Mental Health Helpline.
          </p>
        </div>
        <a
          href="tel:1926"
          className="inline-flex items-center gap-2 bg-white text-[#D9635A] hover:bg-[#F7F5EF] font-semibold text-xs sm:text-sm px-4 py-2 rounded-full transition-all shadow-sm shrink-0 whitespace-nowrap"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Call 1926 (24/7 Toll-Free)
        </a>
      </div>
    </div>
  );
};
