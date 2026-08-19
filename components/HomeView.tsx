'use client';

import React, { useState, useEffect } from 'react';
import { usePsyNova } from '@/lib/store';
import { Psychiatrist, DoctorSlot } from '@/lib/types';
import { BreathingExercise } from './BreathingExercise';
import { DoctorModal } from './DoctorModal';
import {
  ShieldCheck,
  Lock,
  Video,
  Heart,
  Quote,
  ArrowRight,
  Star,
  Sparkles,
  Award,
  Globe,
  Clock,
  ChevronRight,
  Crown
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onSelectDoctorToBook: (doctor: Psychiatrist, slot: DoctorSlot) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab, onSelectDoctorToBook }) => {
  const { psychiatrists, platformSettings } = usePsyNova();
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Psychiatrist | null>(null);

  // Filter ONLY boosted psychiatrists for the Home Page Spotlight
  const boostedDoctors = psychiatrists.filter((d) => d.status === 'approved' && d.isBoosted);

  // Rotating affirmations for narrative section
  const affirmations = [
    '“Healing begins when you feel heard, safe, and truly understood in your own language.”',
    '“Mental wellbeing is not a luxury — it is the quiet foundation of a peaceful life.”',
    '“Taking one gentle step today creates room for hope and clarity tomorrow.”',
  ];

  const [currentAffirmationIdx, setCurrentAffirmationIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAffirmationIdx((prev) => (prev + 1) % affirmations.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [affirmations.length]);

  return (
    <div className="w-full space-y-16 pb-12">
      {/* 1. Full-Bleed Hero Section with Cover Image */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-between px-6 sm:px-12 lg:px-16 py-16 overflow-hidden rounded-b-[40px] shadow-xl">
        {/* Full-Covered Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={platformSettings?.heroImageUrl || "/hero-mindfulness.jpg"}
            alt="Calm mindfulness healthcare setting"
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          {/* Theme overlay gradient with optical opacity for visible, warm background image */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D3728]/90 via-[#2D3728]/60 to-[#2D3728]/35" />
        </div>

        {/* Left Hero Column */}
        <div className="relative z-10 w-full lg:w-3/5 space-y-6 text-left my-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-medium tracking-wide text-[#F7F5EF]">
            <ShieldCheck className="w-4 h-4 text-[#F7F5EF]" />
            <span>SLMC-Verified Telehealth Sri Lanka</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-medium leading-tight tracking-tight text-[#F7F5EF]">
            healing is a <br />conversation away.
          </h1>

          <p className="text-base sm:text-lg max-w-xl text-[#F7F5EF]/90 leading-relaxed font-normal">
            Connect with SLMC-verified psychiatrists in a private, nurturing space designed for your peace of mind.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setActiveTab('psychiatrists')}
              className="px-8 py-4 rounded-full text-base sm:text-lg font-medium shadow-md transition-all hover:opacity-95 flex items-center gap-2 bg-[#F7F5EF] text-[#2D3728]"
            >
              Book a Consultation <ArrowRight className="w-5 h-5 text-[#768c6e]" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('narrative');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 rounded-full text-base sm:text-lg font-medium border-2 border-[#F7F5EF]/80 text-[#F7F5EF] transition-all hover:bg-white/10"
            >
              Our Mission
            </button>
          </div>
        </div>

        {/* Right Hero Column: Breathing Circle Indicator */}
        <div className="relative z-10 hidden lg:flex w-2/5 flex-col items-center justify-center">
          <div className="relative flex items-center justify-center py-6">
            <div className="w-56 h-56 rounded-full border-4 border-[#F7F5EF] opacity-30 animate-pulse" />
            <div
              className="absolute w-40 h-40 rounded-full flex flex-col items-center justify-center text-center px-4"
              style={{
                backgroundColor: 'rgba(247, 245, 239, 0.25)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(247, 245, 239, 0.4)',
              }}
            >
              <Sparkles className="w-6 h-6 text-[#F7F5EF] mb-1" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#F7F5EF]">Calm Presence</span>
              <span className="text-[10px] text-[#F7F5EF]/90 mt-1">Tele-Care Space</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Trust Badge Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="p-6 rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-2">
            <ShieldCheck className="w-8 h-8 text-[#768c6e] mx-auto mb-2" />
            <h4 className="font-bold text-sm text-[#2D3728]">SLMC Verified</h4>
            <p className="text-xs text-[#2D3728]/70 mt-0.5">Strict credential vetting</p>
          </div>
          <div className="p-2">
            <Globe className="w-8 h-8 text-[#768c6e] mx-auto mb-2" />
            <h4 className="font-bold text-sm text-[#2D3728]">3 Languages</h4>
            <p className="text-xs text-[#2D3728]/70 mt-0.5">Sinhala, Tamil & English</p>
          </div>
          <div className="p-2">
            <Lock className="w-8 h-8 text-[#768c6e] mx-auto mb-2" />
            <h4 className="font-bold text-sm text-[#2D3728]">Private & Discrete</h4>
            <p className="text-xs text-[#2D3728]/70 mt-0.5">End-to-end confidentiality</p>
          </div>
          <div className="p-2">
            <Clock className="w-8 h-8 text-[#768c6e] mx-auto mb-2" />
            <h4 className="font-bold text-sm text-[#2D3728]">Islandwide Access</h4>
            <p className="text-xs text-[#2D3728]/70 mt-0.5">Colombo to Jaffna & Galle</p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED DOCTORS SECTION (ABOVE OUR CARE MISSION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 border border-amber-500/30 mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-600" /> Crown Boosted Specialists
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3728]">Featured Specialists</h2>
            <p className="text-xs sm:text-sm text-[#2D3728]/70 mt-1">
              Top SLMC-verified practitioners available for immediate telehealth booking.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('psychiatrists')}
            className="btn-secondary text-xs sm:text-sm shrink-0 flex items-center gap-1"
          >
            View All Approved Specialists ({psychiatrists.filter(d => d.status === 'approved').length}) <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {boostedDoctors.length === 0 ? (
          <div className="p-8 text-center rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 text-[#2D3728]/70">
            <p className="text-sm font-medium">All approved psychiatrists are currently listed in the main directory.</p>
            <button
              onClick={() => setActiveTab('psychiatrists')}
              className="mt-4 btn-primary text-xs"
            >
              Browse Full Doctor Directory
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {boostedDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorForModal(doc)}
                className="psynova-card p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                {/* Crown Badge - Icon Only */}
                <div className="absolute top-4 right-4 z-10 flex items-center justify-center p-2 rounded-full bg-amber-500 text-white font-bold text-xs shadow-sm" title="Crown Boosted">
                  <Crown className="w-4 h-4" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#768c6e]/30 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <h3 className="font-bold text-base text-[#2D3728] group-hover:text-[#768c6e] transition-colors">
                        {doc.name}
                      </h3>
                      <p className="text-xs text-[#2D3728]/80">{doc.title}</p>
                      <p className="text-[11px] font-mono text-[#6B7D5E] mt-0.5">{doc.district} District</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#2D3728]/80 line-clamp-2 leading-relaxed">{doc.bio}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#768c6e]/15">
                    <div className="flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{doc.rating.toFixed(1)}</span>
                      <span className="text-[#2D3728]/60 font-normal">({doc.reviewCount})</span>
                    </div>
                    <span className="font-semibold text-[#2D3728]">{doc.languages.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#768c6e]/15 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#2D3728]">
                    LKR {doc.feeLkr.toLocaleString()}
                  </span>
                  <span className="text-xs font-medium text-[#768c6e] group-hover:underline flex items-center gap-1">
                    Book Consultation <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Narrative & Mission Section with Rotating Affirmation */}
      <section id="narrative" className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider bg-[#768c6e]/15 px-3.5 py-1 rounded-full">
              Our Care Mission
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2D3728] leading-tight">
              A Safe Space Where Mental Healthcare Meets Compassion and Respect
            </h2>
            <p className="text-sm sm:text-base text-[#2D3728]/85 leading-relaxed">
              Finding quality psychiatric care in Sri Lanka should never be overwhelming. PsyNova was founded to eliminate stigma, reduce travel burdens, and offer direct access to top hospital consultants in a calm, private digital setting.
            </p>
            <p className="text-sm text-[#2D3728]/80 leading-relaxed">
              Whether you are managing anxiety, depression, mood changes, or seeking guidance for a loved one, our practitioners listen deeply and design personalized care paths tailored to your background.
            </p>
          </div>

          {/* Rotating Affirmation Card */}
          <div className="lg:col-span-5">
            <div className="psynova-card p-8 text-center relative overflow-hidden bg-[#768c6e]/10 border border-[#768c6e]/25">
              <Quote className="w-10 h-10 text-[#768c6e]/40 mx-auto mb-4" />
              <p className="text-base sm:text-lg font-medium text-[#2D3728] italic min-h-[90px] flex items-center justify-center transition-all duration-500">
                {affirmations[currentAffirmationIdx]}
              </p>
              <div className="flex justify-center gap-1.5 mt-6">
                {affirmations.map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentAffirmationIdx ? 'bg-[#768c6e] w-6' : 'bg-[#768c6e]/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Four Pillars of Care */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-semibold text-[#6B7D5E] uppercase tracking-wider">Core Standards</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#2D3728]">The Four Pillars of PsyNova Care</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="psynova-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#768c6e]/15 text-[#768c6e] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#2D3728]">1. SLMC Verification</h3>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Every specialist undergoes manual Sri Lanka Medical Council credential checking before joining.
            </p>
          </div>

          <div className="psynova-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#768c6e]/15 text-[#768c6e] flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#2D3728]">2. Total Privacy</h3>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Strict identity protection and encrypted tele-rooms keep your consultation private.
            </p>
          </div>

          <div className="psynova-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#768c6e]/15 text-[#768c6e] flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#2D3728]">3. Multilingual</h3>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Receive guidance naturally in Sinhala, Tamil, or English based on your comfort.
            </p>
          </div>

          <div className="psynova-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#768c6e]/15 text-[#768c6e] flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#2D3728]">4. Holistic Care</h3>
            <p className="text-xs text-[#2D3728]/80 leading-relaxed">
              Long-term wellness strategies combining therapy, lifestyle, and medical guidance.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Interactive Grounding / Breathing Pause Moment */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <BreathingExercise />
      </section>

      {/* 6. Final CTA Panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="glass-panel p-8 sm:p-12 rounded-[32px] text-center space-y-4 border border-white/40 shadow-xl bg-gradient-to-br from-[#768c6e]/20 to-[#6B7D5E]/30">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#2D3728]">
            Begin Your Care Journey in Total Privacy Today
          </h2>
          <p className="text-sm sm:text-base text-[#2D3728]/85 max-w-2xl mx-auto leading-relaxed">
            Our compassionate platform connects you directly with verified consultant psychiatrists. No waiting, no exposure, just private mental healthcare tailored to you.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('psychiatrists')}
              className="btn-primary px-8 py-3.5 text-base shadow-lg"
            >
              Explore Available Psychiatrists <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Doctor Modal */}
      <DoctorModal
        doctor={selectedDoctorForModal}
        isOpen={!!selectedDoctorForModal}
        onClose={() => setSelectedDoctorForModal(null)}
        onProceedToBook={(doc, slot) => {
          setSelectedDoctorForModal(null);
          onSelectDoctorToBook(doc, slot);
        }}
      />
    </div>
  );
};
