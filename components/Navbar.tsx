'use client';

import React, { useState } from 'react';
import { usePsyNova } from '@/lib/store';
import { Stethoscope, User, ShieldCheck, Menu, X, ArrowRight, Star, HeartHandshake, PhoneCall, LogOut } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenRoleSelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenRoleSelector }) => {
  const { user, logout } = usePsyNova();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'psychiatrists', label: 'Psychiatrists' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'support', label: 'Support' },
  ];

  if (user.role === 'patient') {
    navItems.push({ id: 'patient-dashboard', label: 'My Bookings' });
  } else if (user.role === 'psychiatrist') {
    navItems.push({ id: 'doctor-portal', label: 'Doctor Portal' });
  } else if (user.role === 'admin') {
    navItems.push({ id: 'admin-overview', label: 'Admin Dashboard' });
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    // If section exists on single scroll home page
    if (['home', 'support'].includes(id) && activeTab === 'home') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    setActiveTab('home');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#768c6e] text-[#F7F5EF] shadow-md transition-all duration-200 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#F7F5EF] text-[#768c6e] flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition-transform">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#F7F5EF]">PsyNova</span>
            <span className="text-[10px] block font-medium text-[#F7F5EF]/80 tracking-widest uppercase">
              Sri Lanka Telehealth
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-2 rounded-full text-xs lg:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#F7F5EF] text-[#768c6e] font-semibold shadow-sm'
                    : 'text-[#F7F5EF]/90 hover:text-[#F7F5EF] hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Auth State / Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {user.role !== 'guest' ? (
            <div className="flex items-center gap-2">
              {/* Signed-In Account Badge */}
              <div
                onClick={() => {
                  if (user.role === 'patient') setActiveTab('patient-dashboard');
                  else if (user.role === 'psychiatrist') setActiveTab('doctor-portal');
                  else if (user.role === 'admin') setActiveTab('admin-overview');
                }}
                className="flex items-center gap-2.5 bg-white/15 border border-white/30 hover:bg-white/20 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#F7F5EF] cursor-pointer transition-all"
                title="View My Account Dashboard"
              >
                <div className="w-6 h-6 rounded-full bg-[#F7F5EF] text-[#768c6e] flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="flex flex-col text-left max-w-[130px]">
                  <span className="font-bold text-xs truncate leading-tight">{user.name}</span>
                  <span className="text-[10px] text-[#F7F5EF]/80 font-mono capitalize truncate">
                    {user.role} {user.clientId ? `• ${user.clientId}` : ''}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-500/20 hover:bg-red-500/35 border border-red-300/40 text-red-100 font-semibold text-xs sm:text-sm transition-all shadow-xs"
                title="Log Out of Account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenRoleSelector}
                className="px-4 py-2 rounded-full border border-white/30 bg-white/10 hover:bg-white/20 font-medium text-xs sm:text-sm transition-all text-[#F7F5EF]"
              >
                Sign In
              </button>
              <button
                onClick={onOpenRoleSelector}
                className="px-4.5 py-2 rounded-full bg-[#F7F5EF] text-[#768c6e] hover:bg-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
              >
                Sign Up / Login
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-[#F7F5EF] hover:bg-white/10"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Slide-Out Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#768c6e] border-t border-white/15 px-4 pt-4 pb-6 space-y-2 animate-fade-in">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-[#F7F5EF] text-[#768c6e] font-semibold'
                  : 'text-[#F7F5EF] hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
            {user.role !== 'guest' ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/10 border border-white/20">
                  <div className="w-8 h-8 rounded-full bg-[#F7F5EF] text-[#768c6e] flex items-center justify-center font-bold text-sm uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{user.name}</div>
                    <div className="text-xs text-white/70 capitalize">{user.role} ({user.email})</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center py-2.5 rounded-xl bg-red-500/30 hover:bg-red-500/40 text-red-100 text-xs font-bold border border-red-200/30 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRoleSelector();
                }}
                className="w-full text-center py-2.5 rounded-xl bg-[#F7F5EF] text-[#768c6e] text-xs font-bold shadow-sm"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
