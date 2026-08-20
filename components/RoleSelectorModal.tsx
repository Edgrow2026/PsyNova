'use client';

import React, { useState, useEffect } from 'react';
import { usePsyNova } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { User, Stethoscope, ShieldCheck, UserCheck, X, ArrowLeft, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({ isOpen, onClose }) => {
  const { setUserRole, registerPatient, loginUser, user } = usePsyNova();

  // Step 1: 'select-role', Step 2: 'auth-form'
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [slmcRegNo, setSlmcRegNo] = useState('');
  const [district, setDistrict] = useState('Colombo');

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const roles: { role: UserRole; title: string; subtitle: string; icon: React.ReactNode; badge: string }[] = [
    {
      role: 'patient',
      title: 'Patient Account',
      subtitle: 'Book tele-consultations, manage appointments, view history & receipts.',
      icon: <UserCheck className="w-6 h-6 text-[#768c6e]" />,
      badge: 'Patient Portal',
    },
    {
      role: 'psychiatrist',
      title: 'SLMC Psychiatrist Portal',
      subtitle: 'Manage SLMC credentials, set availability, view earnings & crown boosts.',
      icon: <Stethoscope className="w-6 h-6 text-[#768c6e]" />,
      badge: 'Specialist Portal',
    },
    {
      role: 'admin',
      title: 'System Platform Admin',
      subtitle: 'Approve SLMC doctors, enforce boost limits, audit reviews & payouts.',
      icon: <ShieldCheck className="w-6 h-6 text-[#768c6e]" />,
      badge: 'Admin Control',
    },
    {
      role: 'guest',
      title: 'Public Visitor / Guest',
      subtitle: 'Browse homepage, search SLMC verified doctors, and explore public reviews.',
      icon: <User className="w-6 h-6 text-[#768c6e]" />,
      badge: 'Public View',
    },
  ];

  const handleRoleClick = (role: UserRole) => {
    setErrorMsg(null);
    if (role === 'guest') {
      setUserRole('guest');
      onClose();
    } else {
      setSelectedRole(role);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!selectedRole) return;

    if (authMode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (selectedRole === 'patient') {
        const rawPhone = phone.trim();
        const formattedPhone = rawPhone
          ? rawPhone.startsWith('+94')
            ? rawPhone
            : `+94 ${rawPhone.replace(/^0/, '')}`
          : '+94 77 123 4567';

        const res = registerPatient({
          name: fullName.trim(),
          email: emailOrPhone.trim(),
          phone: formattedPhone,
          district,
          password,
        });
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to complete registration.');
          return;
        }
      } else {
        setUserRole(selectedRole);
      }
    } else {
      // Sign In mode
      const res = loginUser(emailOrPhone.trim(), password, selectedRole);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed.');
        return;
      }
    }

    // Reset local inputs
    setEmailOrPhone('');
    setPassword('');
    setFullName('');
    setSlmcRegNo('');
    setErrorMsg(null);
    setSelectedRole(null);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D3728]/60 backdrop-blur-md animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#F7F5EF] rounded-[28px] shadow-2xl border border-[#768c6e]/20 p-6 sm:p-8 overflow-hidden animate-scale-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#768c6e]/15">
          <div className="flex items-center gap-3">
            {selectedRole && (
              <button
                onClick={() => setSelectedRole(null)}
                className="p-2 rounded-full hover:bg-[#768c6e]/10 text-[#2D3728] transition-colors"
                title="Back to Role Selection"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-[#768c6e]/15 text-[#6B7D5E] uppercase tracking-wider mb-0.5">
                {selectedRole ? `${selectedRole.toUpperCase()} AUTHENTICATION` : 'STEP 1: SELECT YOUR ROLE'}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3728]">
                {selectedRole ? (authMode === 'signin' ? 'Sign In to Your Account' : 'Create New Account') : 'Choose Account Access Role'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#768c6e]/10 text-[#2D3728]/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Select Role First */}
        {!selectedRole ? (
          <div className="mt-5 space-y-4">
            <p className="text-xs sm:text-sm text-[#2D3728]/80 leading-relaxed">
              Please select your role first to proceed with Sign In or Account Registration:
            </p>

            <div className="space-y-3">
              {roles.map((item) => {
                const isSelected = user.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => handleRoleClick(item.role)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-200 border flex items-start gap-4 ${
                      isSelected
                        ? 'bg-[#768c6e]/15 border-[#768c6e] shadow-sm'
                        : 'bg-white/70 hover:bg-white border-[#768c6e]/15 hover:border-[#768c6e]/40'
                    }`}
                  >
                    <div className="p-3 rounded-xl bg-[#768c6e]/10 shrink-0 mt-0.5">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-bold text-[#2D3728] text-base">{item.title}</h3>
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#768c6e]/10 text-[#6B7D5E] border border-[#768c6e]/20 shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#2D3728]/70 mt-1 line-clamp-2">{item.subtitle}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Step 2: Sign In / Sign Up Form for Chosen Role */
          <div className="mt-5 space-y-5">
            {/* Toggle Sign In / Sign Up */}
            <div className="flex p-1 bg-white/80 rounded-2xl border border-[#768c6e]/20">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signin'
                    ? 'bg-[#768c6e] text-[#F7F5EF] shadow-sm'
                    : 'text-[#2D3728]/70 hover:text-[#2D3728]'
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMode === 'signup'
                    ? 'bg-[#768c6e] text-[#F7F5EF] shadow-sm'
                    : 'text-[#2D3728]/70 hover:text-[#2D3728]'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div className="flex-1">{errorMsg}</div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs sm:text-sm">
              {authMode === 'signup' && (
                <div>
                  <label className="font-semibold text-[#2D3728]/80 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={selectedRole === 'psychiatrist' ? 'Dr. Ananda Wickramasinghe' : 'Dilshan Silva'}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                  />
                </div>
              )}

              {selectedRole === 'patient' && authMode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#2D3728]/80 block mb-1">Mobile Contact</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 077 123 4567"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#2D3728]/80 block mb-1">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none"
                    >
                      <option value="Colombo">Colombo</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kurunegala">Kurunegala</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedRole === 'psychiatrist' && authMode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#2D3728]/80 block mb-1">SLMC Reg. Number</label>
                    <input
                      type="text"
                      required
                      value={slmcRegNo}
                      onChange={(e) => setSlmcRegNo(e.target.value)}
                      placeholder="e.g. SLMC-14829"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white font-mono text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#2D3728]/80 block mb-1">District</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none"
                    >
                      <option value="Colombo">Colombo</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Gampaha">Gampaha</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kurunegala">Kurunegala</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="font-semibold text-[#2D3728]/80 block mb-1">
                  {selectedRole === 'psychiatrist' ? 'SLMC Email Address' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={
                    selectedRole === 'admin'
                      ? 'admin@psynova.lk'
                      : selectedRole === 'psychiatrist'
                      ? 'doctor@psynova.lk'
                      : 'patient@example.lk'
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#2D3728]/80 block">Password</label>
                  <span className="text-[10px] text-[#2D3728]/60">6-10 characters</span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. Pass12#"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#768c6e]/30 bg-white text-[#2D3728] focus:outline-none focus:ring-2 focus:ring-[#768c6e]"
                />
                <p className="text-[11px] text-[#2D3728]/60 mt-1.5 leading-tight bg-[#768c6e]/10 p-2 rounded-lg border border-[#768c6e]/20">
                  <span className="font-semibold text-[#2D3728]">Password rules:</span> 6–10 chars, min 1 uppercase, 1 lowercase, 1 special character (!@#$%^&*), and min 2 digits (e.g., <code className="font-mono bg-white px-1 py-0.5 rounded text-[#768c6e] font-bold">Pass12#</code>).
                </p>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-3 text-sm font-semibold shadow-md mt-2"
              >
                {authMode === 'signin' ? `Sign In as ${selectedRole.toUpperCase()}` : `Complete ${selectedRole.toUpperCase()} Sign Up`}
              </button>
            </form>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[#768c6e]/15 flex items-center justify-between text-xs text-[#2D3728]/60">
          <span>Active Session: <strong className="text-[#6B7D5E] uppercase">{user.role}</strong></span>
          <span>SLMC Verified Platform • LKR Telehealth</span>
        </div>
      </div>
    </div>
  );
};

