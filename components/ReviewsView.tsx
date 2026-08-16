'use client';

import React, { useState } from 'react';
import { usePsyNova } from '@/lib/store';
import { Star, ThumbsUp, ShieldCheck, CheckCircle2, MessageSquare, Search, Filter } from 'lucide-react';

export const ReviewsView: React.FC = () => {
  const { reviews, voteHelpfulReview, psychiatrists } = usePsyNova();
  const [selectedStar, setSelectedStar] = useState<number | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Overall platform calculation
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
      : '5.0';

  // Star breakdown count
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating in ratingDistribution) {
      ratingDistribution[r.rating as 1 | 2 | 3 | 4 | 5]++;
    }
  });

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesStar = selectedStar === 'All' || r.rating === selectedStar;
    const matchesSearch =
      r.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStar && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B7D5E] bg-[#768c6e]/15 px-3 py-1 rounded-full">
          Verified Telehealth Feedback
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2D3728]">Patient Experiences & Reviews</h1>
        <p className="text-sm text-[#2D3728]/80 max-w-2xl">
          Real experiences shared by patients across Sri Lanka after completing verified online psychiatric consultations on PsyNova.
        </p>
      </div>

      {/* Play Store Style Rating Overview Card */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#F7F5EF] border border-[#768c6e]/20 shadow-md grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        {/* Left Rating Summary */}
        <div className="text-center md:border-r md:border-[#768c6e]/20 md:pr-8 space-y-2">
          <span className="text-5xl font-black text-[#2D3728]">{avgRating}</span>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((st) => (
              <Star key={st} className="w-5 h-5 text-amber-500 fill-amber-500" />
            ))}
          </div>
          <p className="text-xs font-medium text-[#2D3728]/70">Based on {totalReviewsCount} Verified Tele-Consultations</p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6B7D5E] bg-[#768c6e]/10 px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% ID Confidential & Authenticated
            </span>
          </div>
        </div>

        {/* Right Distribution Bar Chart */}
        <div className="md:col-span-2 space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingDistribution[stars as 1 | 2 | 3 | 4 | 5];
            const pct = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-4 font-mono font-bold text-right text-[#2D3728]">{stars}</span>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full bg-[#768c6e] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-xs text-[#2D3728]/70 font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 border border-[#768c6e]/15">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <span className="text-xs font-semibold text-[#6B7D5E] shrink-0">Filter Stars:</span>
          {['All', 5, 4, 3].map((st) => (
            <button
              key={st.toString()}
              onClick={() => setSelectedStar(st as number | 'All')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedStar === st
                  ? 'bg-[#768c6e] text-[#F7F5EF] shadow-sm'
                  : 'bg-white text-[#2D3728]/70 hover:bg-[#768c6e]/10 border border-[#768c6e]/20'
              }`}
            >
              {st === 'All' ? 'All Reviews' : `${st} ★ Only`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#768c6e] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search review text or doctor..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#768c6e]/25 bg-white text-xs text-[#2D3728] focus:outline-none"
          />
        </div>
      </div>

      {/* Reviews Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="md:col-span-2 p-8 text-center rounded-[24px] bg-[#F7F5EF] border border-[#768c6e]/20 text-[#2D3728]/70">
            No review entries found matching this criteria.
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="psynova-card p-6 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#768c6e]/20 text-[#6B7D5E] font-bold text-sm flex items-center justify-center">
                      {rev.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#2D3728]">{rev.patientName}</h4>
                        {rev.isVerified && (
                          <span className="text-[10px] font-semibold text-[#6B7D5E] bg-[#768c6e]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Session
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#2D3728]/60">{rev.patientDistrict} • Reviewed on {rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>

                {/* Doctor Consulted Label */}
                <div className="text-xs bg-white/80 p-2.5 rounded-xl border border-[#768c6e]/15 font-medium text-[#2D3728]">
                  <span className="text-[#6B7D5E]">Consulted Specialist:</span> {rev.doctorName}
                </div>

                <p className="text-xs sm:text-sm text-[#2D3728]/85 leading-relaxed">{rev.text}</p>
              </div>

              <div className="pt-3 border-t border-[#768c6e]/15 flex items-center justify-between text-xs text-[#2D3728]/60">
                <button
                  onClick={() => voteHelpfulReview(rev.id)}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#6B7D5E] hover:text-[#768c6e] transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulCount})
                </button>
                <span>Confidential Telehealth</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
