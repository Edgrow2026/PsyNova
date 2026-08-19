'use client';

import React, { useState } from 'react';
import { PsyNovaProvider, usePsyNova } from '@/lib/store';
import { Psychiatrist, DoctorSlot, Booking } from '@/lib/types';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CrisisBand } from '@/components/CrisisBand';
import { RoleSelectorModal } from '@/components/RoleSelectorModal';
import { PayHereCheckoutModal } from '@/components/PayHereCheckoutModal';
import { GuestAuthModal } from '@/components/GuestAuthModal';
import { HomeView } from '@/components/HomeView';
import { PsychiatristsView } from '@/components/PsychiatristsView';
import { ReviewsView } from '@/components/ReviewsView';
import { AboutAndSupportView } from '@/components/AboutAndSupportView';
import { PatientDashboard } from '@/components/PatientDashboard';
import { DoctorPortal } from '@/components/DoctorPortal';
import { AdminDashboard } from '@/components/AdminDashboard';

function MainAppContent() {
  const { user, showRoleSelector, setShowRoleSelector } = usePsyNova();
  const [activeTab, setActiveTab] = useState<string>('home');

  // Booking Modal & Guest Auth States
  const [bookingDoctor, setBookingDoctor] = useState<Psychiatrist | null>(null);
  const [bookingSlot, setBookingSlot] = useState<DoctorSlot | null>(null);
  const [isPayHereModalOpen, setIsPayHereModalOpen] = useState(false);

  // Guest Auth Intercept State
  const [guestAuthDoctor, setGuestAuthDoctor] = useState<Psychiatrist | null>(null);
  const [guestAuthSlot, setGuestAuthSlot] = useState<DoctorSlot | null>(null);
  const [isGuestAuthOpen, setIsGuestAuthOpen] = useState(false);

  // Patient info override from guest sign up
  const [patientDataOverride, setPatientDataOverride] = useState<{
    name?: string;
    email?: string;
    contact?: string;
  }>({});

  const handleSelectDoctorToBook = (doc: Psychiatrist, slot: DoctorSlot) => {
    if (user.role === 'guest') {
      // Guest visitor ready to book: Prompt to sign in or register patient account first
      setGuestAuthDoctor(doc);
      setGuestAuthSlot(slot);
      setIsGuestAuthOpen(true);
      return;
    }

    // Already signed in user
    setBookingDoctor(doc);
    setBookingSlot(slot);
    setIsPayHereModalOpen(true);
  };

  const handleGuestAuthSuccess = (patientData: { name: string; email: string; contact: string }) => {
    setIsGuestAuthOpen(false);
    setPatientDataOverride(patientData);

    if (guestAuthDoctor && guestAuthSlot) {
      setBookingDoctor(guestAuthDoctor);
      setBookingSlot(guestAuthSlot);
      setIsPayHereModalOpen(true);
    }
  };

  const handleBookingSuccess = (createdBooking: Booking) => {
    // Navigate to patient dashboard on successful booking
    setActiveTab('patient-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#B9CDAE] text-[#2D3728]">
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRoleSelector={() => setShowRoleSelector(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            onSelectDoctorToBook={handleSelectDoctorToBook}
          />
        )}

        {activeTab === 'psychiatrists' && (
          <PsychiatristsView onSelectDoctorToBook={handleSelectDoctorToBook} />
        )}

        {activeTab === 'reviews' && <ReviewsView />}

        {activeTab === 'about' && <AboutAndSupportView initialTab="about" />}

        {activeTab === 'support' && <AboutAndSupportView initialTab="support" />}

        {activeTab === 'patient-dashboard' && (
          <PatientDashboard setActiveTab={setActiveTab} />
        )}

        {activeTab === 'doctor-portal' && <DoctorPortal />}

        {activeTab.startsWith('admin') && (
          <AdminDashboard
            activeSubTab={activeTab.replace('admin-', '') || 'overview'}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Crisis Safety Band (Always Visible near bottom of every page) */}
      <CrisisBand />

      {/* Site Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* Role Selection Modal */}
      <RoleSelectorModal
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
      />

      {/* Guest Sign-In / Register Intercept Modal */}
      <GuestAuthModal
        isOpen={isGuestAuthOpen}
        doctor={guestAuthDoctor}
        slot={guestAuthSlot}
        onClose={() => setIsGuestAuthOpen(false)}
        onAuthSuccess={handleGuestAuthSuccess}
      />

      {/* PayHere Gateway Checkout Booking Modal */}
      <PayHereCheckoutModal
        doctor={bookingDoctor}
        slot={bookingSlot}
        isOpen={isPayHereModalOpen}
        patientDataOverride={patientDataOverride}
        onClose={() => setIsPayHereModalOpen(false)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}

export default function Page() {
  return (
    <PsyNovaProvider>
      <MainAppContent />
    </PsyNovaProvider>
  );
}
