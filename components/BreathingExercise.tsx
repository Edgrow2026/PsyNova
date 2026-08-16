'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, HeartPulse, ShieldCheck, RefreshCw } from 'lucide-react';

export const BreathingExercise: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding'>('breathing');
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [secondsLeft, setSecondsLeft] = useState<number>(4);

  // Breathing timer cycle: 4s Inhale, 4s Hold, 4s Exhale, 4s Pause
  useEffect(() => {
    if (activeTab !== 'breathing') return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Transition to next phase
        setPhase((curr) => {
          if (curr === 'Inhale') return 'Hold';
          if (curr === 'Hold') return 'Exhale';
          if (curr === 'Exhale') return 'Pause';
          return 'Inhale';
        });

        return 4;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const groundingSteps = [
    { num: '5', label: 'Things you can SEE', desc: 'Look around you. Notice five distinct colors, shapes, or peaceful light patterns.' },
    { num: '4', label: 'Things you can TOUCH', desc: 'Feel four textures near you — your clothing, the chair support, or a cool desk surface.' },
    { num: '3', label: 'Things you can HEAR', desc: 'Listen softly for three ambient sounds — distant birds, fan humming, or your quiet breath.' },
    { num: '2', label: 'Things you can SMELL', desc: 'Notice two scents in the air — fresh tea, warm wood, or clean garden rain.' },
    { num: '1', label: 'Thing you can TASTE', desc: 'Take one calm sip of water or notice the clean sensation in your breath.' },
  ];

  return (
    <div className="w-full py-16 px-4 sm:px-8 bg-[#6B7D5E]/10 rounded-[32px] border border-[#768c6e]/20 backdrop-blur-md my-12">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#768c6e]/15 text-[#2D3728] uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#768c6e]" /> Pause & Center Moment
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3728]">
          Take a Gentle Breath Before You Begin
        </h2>
        <p className="text-sm sm:text-base text-[#2D3728]/80 max-w-xl mx-auto mt-2 leading-relaxed">
          Healthcare starts with taking a quiet moment for yourself. Try our guided breathing cycle or sensory grounding tool below.
        </p>

        {/* Tab Selector */}
        <div className="flex justify-center mt-6 gap-2 p-1.5 bg-[#F7F5EF] rounded-full max-w-xs mx-auto border border-[#768c6e]/20">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'breathing'
                ? 'bg-[#768c6e] text-[#F7F5EF] shadow-sm'
                : 'text-[#2D3728]/70 hover:text-[#2D3728]'
            }`}
          >
            Guided Breathing
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 py-2 px-4 rounded-full text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'grounding'
                ? 'bg-[#768c6e] text-[#F7F5EF] shadow-sm'
                : 'text-[#2D3728]/70 hover:text-[#2D3728]'
            }`}
          >
            5-4-3-2-1 Grounding
          </button>
        </div>

        {/* Tab 1: Breathing Circle */}
        {activeTab === 'breathing' && (
          <div className="mt-10 flex flex-col items-center justify-center min-h-[280px]">
            <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-[#768c6e]/30 transition-all duration-1000 ${
                  phase === 'Inhale'
                    ? 'scale-110 bg-[#768c6e]/20 border-[#768c6e]'
                    : phase === 'Hold'
                    ? 'scale-110 bg-[#768c6e]/25 border-[#768c6e]'
                    : phase === 'Exhale'
                    ? 'scale-90 bg-[#768c6e]/10 border-[#768c6e]/40'
                    : 'scale-90 bg-transparent border-[#768c6e]/20'
                }`}
              />
              
              {/* Inner Circle */}
              <div
                className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#768c6e] text-[#F7F5EF] flex flex-col items-center justify-center shadow-xl transition-all duration-1000 transform ${
                  phase === 'Inhale'
                    ? 'scale-105 bg-[#62755b]'
                    : phase === 'Hold'
                    ? 'scale-105 bg-[#62755b]'
                    : 'scale-95 bg-[#768c6e]'
                }`}
              >
                <HeartPulse className="w-8 h-8 mb-1 animate-pulse text-[#F7F5EF]/90" />
                <span className="text-xl sm:text-2xl font-bold tracking-wide">{phase}</span>
                <span className="text-xs text-[#F7F5EF]/80 mt-1 font-mono">{secondsLeft}s</span>
              </div>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-[#2D3728]/70 italic">
              Softly synchronize your breathing with the expanding circle.
            </p>
          </div>
        )}

        {/* Tab 2: Grounding Technique */}
        {activeTab === 'grounding' && (
          <div className="mt-8 text-left grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {groundingSteps.map((step) => (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-[#F7F5EF]/90 border border-[#768c6e]/20 shadow-sm flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[#768c6e] text-[#F7F5EF] font-bold text-lg flex items-center justify-center shrink-0">
                  {step.num}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#2D3728]">{step.label}</h4>
                  <p className="text-xs text-[#2D3728]/80 mt-1 leading-normal">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
