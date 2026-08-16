'use client';

import React, { useState } from 'react';
import { usePsyNova } from '@/lib/store';
import { Psychiatrist, DoctorSlot } from '@/lib/types';
import { DoctorModal } from './DoctorModal';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Crown,
  Languages,
  Video,
  MapPin,
  ArrowRight,
  SlidersHorizontal,
  X
} from 'lucide-react';

interface PsychiatristsViewProps {
  onSelectDoctorToBook: (doctor: Psychiatrist, slot: DoctorSlot) => void;
}

export const PsychiatristsView: React.FC<PsychiatristsViewProps> = ({ onSelectDoctorToBook }) => {
  const { psychiatrists } = usePsyNova();
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Psychiatrist | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [maxFee, setMaxFee] = useState<number>(10000);

  // Gating: ONLY APPROVED doctors are visible publicly
  const approvedDoctors = psychiatrists.filter((d) => d.status === 'approved');

  // Filter Logic
  const filteredDoctors = approvedDoctors.filter((doc) => {
    // Search
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Language
    const matchesLanguage = selectedLanguage === 'All' || doc.languages.includes(selectedLanguage);

    // Specialty
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialties.includes(selectedSpecialty);

    // District
    const matchesDistrict = selectedDistrict === 'All' || doc.district === selectedDistrict;

    // Fee
    const matchesFee = doc.feeLkr <= maxFee;

    return matchesSearch && matchesLanguage && matchesSpecialty && matchesDistrict && matchesFee;
  });

  // Sort: Boosted doctors (crown badge) ALWAYS sort first
  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (a.isBoosted && !b.isBoosted) return -1;
    if (!a.isBoosted && b.isBoosted) return 1;
    return b.rating - a.rating;
  });

  const languagesList = ['All', 'Sinhala', 'Tamil', 'English'];
  const districtsList = ['All', 'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'Gampaha'];
  const specialtiesList = [
    'All',
    'Depression & Anxiety',
    'Child & Adolescent',
    'PTSD & Trauma',
    'Addiction Recovery',
    'Perinatal Depression',
    'Stress Management',
  ];

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedLanguage('All');
    setSelectedSpecialty('All');
    setSelectedDistrict('All');
    setMaxFee(10000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7D5E] bg-[#768c6e]/15 px-3 py-1 rounded-full">
          SLMC Licensed Specialists
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D3728]">Find Your Psychiatrist</h1>
        <p className="text-sm text-[#2D3728]/80 max-w-2xl">
          Search and filter fully verified consultant psychiatrists across Sri Lanka. Every specialist is approved for confidential online video telehealth.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-6 rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Query Input */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-[#768c6e] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, title, or clinical focus..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#768c6e]/25 bg-white text-xs sm:text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
            />
          </div>

          {/* Language Selector */}
          <div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#768c6e]/25 bg-white text-xs sm:text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
            >
              <option value="All">Language: All</option>
              {languagesList.filter((l) => l !== 'All').map((l) => (
                <option key={l} value={l}>Language: {l}</option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#768c6e]/25 bg-white text-xs sm:text-sm text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
            >
              <option value="All">District: All</option>
              {districtsList.filter((d) => d !== 'All').map((d) => (
                <option key={d} value={d}>District: {d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#768c6e]/15 items-center">
          {/* Specialty Dropdown */}
          <div>
            <label className="text-[11px] font-semibold text-[#6B7D5E] block mb-1">Specialty Focus</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#768c6e]/25 bg-white text-xs text-[#2D3728] focus:outline-none"
            >
              <option value="All">Specialty: All Focus Areas</option>
              {specialtiesList.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Max Fee Slider */}
          <div>
            <div className="flex justify-between text-[11px] font-semibold text-[#6B7D5E] mb-1">
              <span>Max Fee: LKR {maxFee.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={3000}
              max={10000}
              step={500}
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-[#768c6e]"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="flex items-end justify-end">
            <button
              onClick={clearFilters}
              className="text-xs text-[#768c6e] hover:underline font-semibold flex items-center gap-1 py-2"
            >
              <X className="w-3.5 h-3.5" /> Reset All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-[#2D3728]/70 font-mono">
            Showing <strong>{sortedDoctors.length}</strong> SLMC Verified Psychiatrists
          </p>
        </div>

        {sortedDoctors.length === 0 ? (
          <div className="p-12 text-center rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 space-y-3">
            <p className="text-base font-semibold text-[#2D3728]">No matching psychiatrists found</p>
            <p className="text-xs text-[#2D3728]/70 max-w-md mx-auto">
              Try broadening your search query or selecting a different language or fee range.
            </p>
            <button onClick={clearFilters} className="btn-secondary text-xs mt-2">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoctorForModal(doc)}
                className="psynova-card p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden"
              >
                {/* Crown Badge if boosted */}
                {doc.isBoosted && (
                  <div className="absolute top-4 right-4 z-10 flex items-center justify-center p-2 rounded-full bg-amber-500 text-white font-bold text-xs shadow-sm" title="Crown Boosted">
                    <Crown className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={doc.photo}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#768c6e]/30 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1 flex-wrap">
                        <h3 className="font-bold text-base text-[#2D3728] group-hover:text-[#768c6e] transition-colors">
                          {doc.name}
                        </h3>
                      </div>
                      <p className="text-xs text-[#2D3728]/80">{doc.title}</p>
                      <p className="text-[11px] font-mono text-[#6B7D5E] mt-0.5">
                        {doc.slmcRegNo} • {doc.district} District
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#2D3728]/80 line-clamp-2 leading-relaxed">{doc.bio}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.specialties.slice(0, 3).map((spec, i) => (
                      <span key={i} className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#768c6e]/10 text-[#2D3728]">
                        {spec}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-[#768c6e]/15">
                    <div className="flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{doc.rating.toFixed(1)}</span>
                      <span className="text-[#2D3728]/60 font-normal">({doc.reviewCount})</span>
                    </div>
                    <span className="font-medium text-[#2D3728]">{doc.languages.join(', ')}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#768c6e]/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#2D3728]/60 block font-medium">Session Fee</span>
                    <span className="text-sm font-mono font-bold text-[#2D3728]">
                      LKR {doc.feeLkr.toLocaleString()}
                    </span>
                  </div>
                  <span className="btn-primary text-xs py-2 px-3.5">
                    View Profile & Book
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
