'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  User,
  Psychiatrist,
  Booking,
  Review,
  Complaint,
  PlatformSettings,
  BoostTier,
  PatientAccount,
} from './types';
import {
  initialPlatformSettings,
  initialPsychiatrists,
  initialBookings,
  initialReviews,
  initialComplaints,
  initialPatients,
} from './mockData';

interface PsyNovaContextType {
  user: User;
  setUserRole: (role: UserRole) => void;
  showRoleSelector: boolean;
  setShowRoleSelector: (show: boolean) => void;
  psychiatrists: Psychiatrist[];
  bookings: Booking[];
  reviews: Review[];
  complaints: Complaint[];
  platformSettings: PlatformSettings;
  patients: PatientAccount[];
  registerPatient: (patientData: { name: string; email: string; phone: string; district?: string }) => PatientAccount;
  
  // Actions
  boostPsychiatrist: (doctorId: string, tier: BoostTier) => { success: boolean; message: string };
  unboostPsychiatrist: (doctorId: string) => void;
  updateDoctorStatus: (doctorId: string, status: 'approved' | 'pending' | 'suspended') => void;
  addDoctor: (doc: Partial<Psychiatrist>) => void;
  uploadDoctorDoc: (doctorId: string, docName: string) => void;
  deleteDoctorDoc: (doctorId: string, docId: string) => void;
  
  // Booking actions
  createBooking: (bookingData: {
    doctorId: string;
    slotId: string;
    slotDatetime: string;
    patientName: string;
    patientEmail: string;
    patientContact: string;
  }) => { success: boolean; booking?: Booking; error?: string };
  cancelBooking: (bookingId: string, note?: string) => void;
  completeBooking: (bookingId: string) => void;
  markPayoutPaid: (bookingId: string) => void;

  // Review actions
  addReview: (doctorId: string, rating: number, text: string) => void;
  voteHelpfulReview: (reviewId: string) => void;
  flagReview: (reviewId: string, note?: string) => void;

  // Complaint actions
  addComplaint: (bookingId: string, reason: string, details: string) => void;
  resolveComplaint: (complaintId: string, proofUrl: string, note: string) => void;

  // Settings
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  
  // Account
  deactivatePatientAccount: () => void;
}

const PsyNovaContext = createContext<PsyNovaContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'psynova_state_v1';

export const PsyNovaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: 'usr-guest',
    email: 'visitor@psynova.lk',
    name: 'Guest Visitor',
    role: 'guest',
  });

  const [showRoleSelector, setShowRoleSelector] = useState<boolean>(false);
  const [psychiatrists, setPsychiatrists] = useState<Psychiatrist[]>(() => {
    if (typeof window === 'undefined') return initialPsychiatrists;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.psychiatrists) return parsed.psychiatrists;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPsychiatrists;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (typeof window === 'undefined') return initialBookings;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bookings) return parsed.bookings;
      }
    } catch (e) {
      console.error(e);
    }
    return initialBookings;
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return initialReviews;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.reviews) return parsed.reviews;
      }
    } catch (e) {
      console.error(e);
    }
    return initialReviews;
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    if (typeof window === 'undefined') return initialComplaints;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.complaints) return parsed.complaints;
      }
    } catch (e) {
      console.error(e);
    }
    return initialComplaints;
  });

  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    if (typeof window === 'undefined') return initialPlatformSettings;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.platformSettings) return parsed.platformSettings;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPlatformSettings;
  });

  const [patients, setPatients] = useState<PatientAccount[]>(() => {
    if (typeof window === 'undefined') return initialPatients;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.patients && Array.isArray(parsed.patients)) return parsed.patients;
      }
    } catch (e) {
      console.error(e);
    }
    return initialPatients;
  });

  const registerPatient = (patientData: { name: string; email: string; phone: string; district?: string }): PatientAccount => {
    const existing = patients.find((p) => p.email.toLowerCase() === patientData.email.toLowerCase());
    if (existing) {
      return existing;
    }

    const newPatient: PatientAccount = {
      id: `pat-${Date.now()}`,
      clientId: `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: patientData.name || 'Registered Patient',
      email: patientData.email,
      phone: patientData.phone || '+94 77 000 0000',
      district: patientData.district || 'Colombo',
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  };

  // Initial load from NestJS backend API routes
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [docsRes, bookingsRes, reviewsRes, complaintsRes, settingsRes] = await Promise.all([
          fetch('/api/psychiatrists'),
          fetch('/api/bookings'),
          fetch('/api/reviews'),
          fetch('/api/complaints'),
          fetch('/api/settings'),
        ]);

        if (docsRes.ok) {
          const docs = await docsRes.json();
          if (Array.isArray(docs) && docs.length > 0) setPsychiatrists(docs);
        }
        if (bookingsRes.ok) {
          const bks = await bookingsRes.json();
          if (Array.isArray(bks) && bks.length > 0) setBookings(bks);
        }
        if (reviewsRes.ok) {
          const revs = await reviewsRes.json();
          if (Array.isArray(revs) && revs.length > 0) setReviews(revs);
        }
        if (complaintsRes.ok) {
          const cmps = await complaintsRes.json();
          if (Array.isArray(cmps) && cmps.length > 0) setComplaints(cmps);
        }
        if (settingsRes.ok) {
          const stgs = await settingsRes.json();
          if (stgs) setPlatformSettings(stgs);
        }
      } catch (err) {
        console.error('NestJS Backend connection error, fallback to local state:', err);
      }
    };

    fetchBackendData();
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          psychiatrists,
          bookings,
          reviews,
          complaints,
          platformSettings,
          patients,
        })
      );
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [psychiatrists, bookings, reviews, complaints, platformSettings, patients]);

  // Handle role selection
  const setUserRole = (role: UserRole) => {
    let newUser: User = {
      id: 'usr-1',
      email: 'user@psynova.lk',
      name: 'User',
      role,
    };

    if (role === 'patient') {
      newUser = {
        id: 'pat-1',
        email: 'dilshan.silva@example.lk',
        name: 'Dilshan Silva',
        role: 'patient',
        clientId: 'PN-PAT-88421',
      };
    } else if (role === 'psychiatrist') {
      newUser = {
        id: 'usr-doc1',
        email: 'dr.ananda@psynova.lk',
        name: 'Dr. Ananda Wickramasinghe',
        role: 'psychiatrist',
        slmcRegNo: 'SLMC-38491',
        doctorId: 'doc-1',
      };
    } else if (role === 'admin') {
      newUser = {
        id: 'adm-1',
        email: 'admin.platform@psynova.lk',
        name: 'System Platform Admin',
        role: 'admin',
      };
    } else {
      newUser = {
        id: 'usr-guest',
        email: 'visitor@psynova.lk',
        name: 'Guest Visitor',
        role: 'guest',
      };
    }

    setUser(newUser);
    setShowRoleSelector(false);
  };

  // Boost Psychiatrist (Strict 9 Max limit enforcement with NestJS backend sync)
  const boostPsychiatrist = (doctorId: string, tier: BoostTier) => {
    const currentlyBoostedCount = psychiatrists.filter((d) => d.isBoosted && d.id !== doctorId).length;
    if (currentlyBoostedCount >= platformSettings.maxBoostedDoctors) {
      return {
        success: false,
        message: `Boost limit reached! Maximum ${platformSettings.maxBoostedDoctors} psychiatrists can be boosted platform-wide at any time.`,
      };
    }

    const daysToAdd = tier === '1-day' ? 1 : 3;
    const expiry = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    setPsychiatrists((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            isBoosted: true,
            boostTier: tier,
            boostExpiry: expiry,
          };
        }
        return doc;
      })
    );

    // Sync to NestJS backend
    fetch('/api/psychiatrists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'boost', doctorId, tier }),
    }).catch((e) => console.error('NestJS sync error:', e));

    return { success: true, message: `Doctor successfully boosted with ${tier} package!` };
  };

  const unboostPsychiatrist = (doctorId: string) => {
    setPsychiatrists((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            isBoosted: false,
            boostTier: 'none',
            boostExpiry: null,
          };
        }
        return doc;
      })
    );

    fetch('/api/psychiatrists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unboost', doctorId }),
    }).catch((e) => console.error('NestJS sync error:', e));
  };

  const updateDoctorStatus = (doctorId: string, status: 'approved' | 'pending' | 'suspended') => {
    setPsychiatrists((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return { ...doc, status };
        }
        return doc;
      })
    );

    fetch('/api/psychiatrists', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId, status }),
    }).catch((e) => console.error('NestJS sync error:', e));
  };

  const addDoctor = (doc: Partial<Psychiatrist>) => {
    const newDoc: Psychiatrist = {
      id: `doc-${Date.now()}`,
      name: doc.name || 'Dr. New Doctor',
      title: doc.title || 'Consultant Psychiatrist',
      slmcRegNo: doc.slmcRegNo || 'SLMC-PENDING',
      status: 'pending',
      isBoosted: false,
      boostTier: 'none',
      boostExpiry: null,
      photo: doc.photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop',
      bio: doc.bio || 'New practitioner registration.',
      languages: doc.languages || ['English', 'Sinhala'],
      sessionFormats: doc.sessionFormats || ['Video Telehealth'],
      specialties: doc.specialties || ['General Psychiatry'],
      district: doc.district || 'Colombo',
      feeLkr: doc.feeLkr || 5000,
      rating: 0,
      reviewCount: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      upcomingSlots: [],
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          name: 'SLMC_Registration_Application.pdf',
          url: '#',
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
        },
      ],
    };
    setPsychiatrists((prev) => [newDoc, ...prev]);
  };

  const uploadDoctorDoc = (doctorId: string, docName: string) => {
    setPsychiatrists((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          const newDoc = {
            id: `doc-file-${Date.now()}`,
            name: docName || 'SLMC_Qualification_Doc.pdf',
            url: '#',
            uploadDate: new Date().toISOString().split('T')[0],
            status: 'Pending' as const,
          };
          return {
            ...doc,
            documents: [newDoc, ...doc.documents],
          };
        }
        return doc;
      })
    );
  };

  const deleteDoctorDoc = (doctorId: string, docId: string) => {
    setPsychiatrists((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            documents: doc.documents.filter((d) => d.id !== docId),
          };
        }
        return doc;
      })
    );
  };

  // Create Booking wrapped in slot checking
  const createBooking = (data: {
    doctorId: string;
    slotId: string;
    slotDatetime: string;
    patientName: string;
    patientEmail: string;
    patientContact: string;
  }) => {
    const doctor = psychiatrists.find((d) => d.id === data.doctorId);
    if (!doctor) return { success: false, error: 'Psychiatrist not found' };

    const slot = doctor.upcomingSlots.find((s) => s.id === data.slotId);
    if (!slot || slot.status === 'booked') {
      return { success: false, error: 'This consultation slot has already been reserved. Please select another time.' };
    }

    const fee = doctor.feeLkr;
    const commission = Math.round(fee * (platformSettings.commissionRate / 100));
    const netDoctor = fee - commission;

    const newBooking: Booking = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: user.id || 'pat-1',
      patientName: data.patientName || user.name,
      patientEmail: data.patientEmail || user.email,
      patientContact: data.patientContact,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorPhoto: doctor.photo,
      slotDatetime: data.slotDatetime,
      feeLkr: fee,
      platformCommissionLkr: commission,
      netDoctorEarningLkr: netDoctor,
      status: 'confirmed',
      paymentStatus: 'paid',
      payhereRef: `PAYHERE-${Math.floor(1000000 + Math.random() * 9000000)}`,
      videoLink: `https://meet.psynova.lk/room/PN-CONF-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: 'pending', timestamp: new Date().toISOString() },
        { status: 'confirmed', timestamp: new Date().toISOString(), note: 'Payment verified via PayHere (LKR)' },
      ],
    };

    // Mark slot as booked
    setPsychiatrists((prev) =>
      prev.map((d) => {
        if (d.id === doctor.id) {
          return {
            ...d,
            upcomingSlots: d.upcomingSlots.map((s) => (s.id === data.slotId ? { ...s, status: 'booked' } : s)),
          };
        }
        return d;
      })
    );

    setBookings((prev) => [newBooking, ...prev]);

    // Ensure patient is in registered patients list
    registerPatient({
      name: data.patientName || user.name,
      email: data.patientEmail || user.email,
      phone: data.patientContact,
    });

    return { success: true, booking: newBooking };
  };

  const cancelBooking = (bookingId: string, note?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'cancelled',
            statusHistory: [
              ...b.statusHistory,
              { status: 'cancelled', timestamp: new Date().toISOString(), note: note || 'Cancelled by user/admin' },
            ],
          };
        }
        return b;
      })
    );
  };

  const completeBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'completed',
            paymentStatus: b.paymentStatus === 'paid' ? 'payout_pending' : b.paymentStatus,
            statusHistory: [
              ...b.statusHistory,
              { status: 'completed', timestamp: new Date().toISOString(), note: 'Consultation marked completed' },
            ],
          };
        }
        return b;
      })
    );
  };

  const markPayoutPaid = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            paymentStatus: 'payout_completed',
          };
        }
        return b;
      })
    );
  };

  const addReview = (doctorId: string, rating: number, text: string) => {
    const doctor = psychiatrists.find((d) => d.id === doctorId);
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      doctorId,
      doctorName: doctor?.name || 'Psychiatrist',
      patientName: user.name || 'Verified Patient',
      patientDistrict: 'Colombo',
      rating,
      date: new Date().toISOString().split('T')[0],
      text,
      isVerified: true,
      helpfulCount: 0,
    };

    setReviews((prev) => [newReview, ...prev]);

    // Update doctor's rating stats
    if (doctor) {
      const newReviewCount = doctor.reviewCount + 1;
      const newDist = { ...doctor.ratingDistribution, [rating]: (doctor.ratingDistribution[rating as 1|2|3|4|5] || 0) + 1 };
      const totalStars = (doctor.rating * doctor.reviewCount) + rating;
      const newAvg = parseFloat((totalStars / newReviewCount).toFixed(2));

      setPsychiatrists((prev) =>
        prev.map((d) => {
          if (d.id === doctorId) {
            return {
              ...d,
              rating: newAvg,
              reviewCount: newReviewCount,
              ratingDistribution: newDist,
            };
          }
          return d;
        })
      );
    }
  };

  const voteHelpfulReview = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return { ...r, helpfulCount: r.helpfulCount + 1 };
        }
        return r;
      })
    );
  };

  const flagReview = (reviewId: string, note?: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          return { ...r, flagged: true, adminNote: note || 'Flagged for audit review' };
        }
        return r;
      })
    );
  };

  const addComplaint = (bookingId: string, reason: string, details: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const newComplaint: Complaint = {
      id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingId,
      patientId: user.id || 'pat-1',
      patientName: user.name || 'Patient',
      doctorId: booking?.doctorId || 'doc-1',
      doctorName: booking?.doctorName || 'Psychiatrist',
      reason,
      details,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setComplaints((prev) => [newComplaint, ...prev]);
  };

  const resolveComplaint = (complaintId: string, proofUrl: string, note: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === complaintId) {
          return {
            ...c,
            status: 'Resolved',
            resolutionProof: proofUrl || 'Proof_Document_Uploaded.pdf',
            resolutionNote: note || 'Issue resolved by administration refund protocol.',
          };
        }
        return c;
      })
    );
  };

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }));
  };

  const deactivatePatientAccount = () => {
    setUser((prev) => ({
      ...prev,
      deactivatedAt: new Date().toISOString(),
    }));
  };

  return (
    <PsyNovaContext.Provider
      value={{
        user,
        setUserRole,
        showRoleSelector,
        setShowRoleSelector,
        psychiatrists,
        bookings,
        reviews,
        complaints,
        platformSettings,
        patients,
        registerPatient,
        boostPsychiatrist,
        unboostPsychiatrist,
        updateDoctorStatus,
        addDoctor,
        uploadDoctorDoc,
        deleteDoctorDoc,
        createBooking,
        cancelBooking,
        completeBooking,
        markPayoutPaid,
        addReview,
        voteHelpfulReview,
        flagReview,
        addComplaint,
        resolveComplaint,
        updatePlatformSettings,
        deactivatePatientAccount,
      }}
    >
      {children}
    </PsyNovaContext.Provider>
  );
};

export const usePsyNova = () => {
  const context = useContext(PsyNovaContext);
  if (!context) {
    throw new Error('usePsyNova must be used within a PsyNovaProvider');
  }
  return context;
};
