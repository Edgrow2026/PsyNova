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

import { validateEmail, validatePassword } from './utils';

interface PsyNovaContextType {
  user: User;
  setUserRole: (role: UserRole) => void;
  logout: () => void;
  loginUser: (email: string, password: string, role?: UserRole) => { success: boolean; error?: string };
  showRoleSelector: boolean;
  setShowRoleSelector: (show: boolean) => void;
  psychiatrists: Psychiatrist[];
  bookings: Booking[];
  reviews: Review[];
  complaints: Complaint[];
  platformSettings: PlatformSettings;
  patients: PatientAccount[];
  registerPatient: (patientData: { name: string; email: string; phone: string; district?: string; password?: string }) => { success: boolean; patient?: PatientAccount; error?: string };
  
  // Actions
  boostPsychiatrist: (doctorId: string, tier: BoostTier) => { success: boolean; message: string };
  unboostPsychiatrist: (doctorId: string) => void;
  updateDoctorStatus: (doctorId: string, status: 'approved' | 'pending' | 'suspended') => void;
  addDoctor: (doc: Partial<Psychiatrist>) => void;
  uploadDoctorDoc: (doctorId: string, docName: string) => void;
  deleteDoctorDoc: (doctorId: string, docId: string) => void;
  addDoctorSlot: (doctorId: string, slot: { id: string; datetime: string; durationMins: number; status: 'available' }) => void;
  
  // Booking actions
  createBooking: (bookingData: {
    doctorId: string;
    slotId: string;
    slotDatetime: string;
    patientName: string;
    patientEmail: string;
    patientContact: string;
  }) => { success: boolean; booking?: Booking; error?: string };
  addConfirmedBooking: (booking: Booking) => void;
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

const LOCAL_STORAGE_KEY = 'psynova_state_v2';

export const PsyNovaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    if (typeof window === 'undefined')
      return { id: 'usr-guest', email: 'visitor@psynova.lk', name: 'Guest Visitor', role: 'guest' };
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user) return parsed.user;
      }
    } catch (e) {
      console.error(e);
    }
    return { id: 'usr-guest', email: 'visitor@psynova.lk', name: 'Guest Visitor', role: 'guest' };
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

  const registerPatient = (patientData: { name: string; email: string; phone: string; district?: string; password?: string }): { success: boolean; patient?: PatientAccount; error?: string } => {
    // Email validation
    const emailVal = validateEmail(patientData.email);
    if (!emailVal.isValid) {
      return { success: false, error: emailVal.error };
    }

    // Password validation
    if (patientData.password) {
      const passVal = validatePassword(patientData.password);
      if (!passVal.isValid) {
        return { success: false, error: passVal.error };
      }
    } else {
      return { success: false, error: 'Password is required for registration.' };
    }

    const cleanEmail = patientData.email.trim().toLowerCase();
    const existing = patients.find((p) => p.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'An account with this email address is already registered. Please Sign In instead.' };
    }

    const newPatient: PatientAccount = {
      id: `pat-${Date.now()}`,
      clientId: `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: patientData.name || 'Registered Patient',
      email: patientData.email.trim(),
      phone: patientData.phone || '',
      district: patientData.district || 'Colombo',
      password: patientData.password,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    setPatients((prev) => [newPatient, ...prev]);

    // Update current active user
    setUser({
      id: newPatient.id,
      email: newPatient.email,
      name: newPatient.name,
      role: 'patient',
      clientId: newPatient.clientId,
    });

    // Save to PostgreSQL database
    fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient),
    }).catch((e) => console.error('Patient database save error:', e));

    return { success: true, patient: newPatient };
  };

  const loginUser = (emailInput: string, passwordInput: string, roleRequested?: UserRole): { success: boolean; error?: string } => {
    const emailVal = validateEmail(emailInput);
    if (!emailVal.isValid) {
      return { success: false, error: emailVal.error };
    }

    const passVal = validatePassword(passwordInput);
    if (!passVal.isValid) {
      return { success: false, error: passVal.error };
    }

    const cleanEmail = emailInput.trim().toLowerCase();

    if (roleRequested === 'psychiatrist') {
      const doctor = psychiatrists.find((d) => d.name.toLowerCase().includes(cleanEmail) || cleanEmail.includes('doc') || cleanEmail.includes('dr'));
      const activeDoc = doctor || psychiatrists[0];
      setUser({
        id: 'usr-doc1',
        email: cleanEmail,
        name: activeDoc ? activeDoc.name : 'Dr. Ananda Wickramasinghe',
        role: 'psychiatrist',
        slmcRegNo: activeDoc ? activeDoc.slmcRegNo : 'SLMC-38491',
        doctorId: activeDoc ? activeDoc.id : 'doc-1',
      });
      setShowRoleSelector(false);
      return { success: true };
    }

    if (roleRequested === 'admin') {
      setUser({
        id: 'adm-1',
        email: cleanEmail,
        name: 'System Platform Admin',
        role: 'admin',
      });
      setShowRoleSelector(false);
      return { success: true };
    }

    // Patient login & credential check
    const foundPatient = patients.find((p) => p.email.toLowerCase() === cleanEmail);
    if (!foundPatient) {
      return {
        success: false,
        error: 'No registered account found with this email. Please check your email or Sign Up for a new account.',
      };
    }

    // Password matching check
    if (foundPatient.password && foundPatient.password !== passwordInput) {
      return {
        success: false,
        error: 'Incorrect password for this email account. Please check your password and try again.',
      };
    }

    setUser({
      id: foundPatient.id,
      email: foundPatient.email,
      name: foundPatient.name,
      role: 'patient',
      clientId: foundPatient.clientId,
    });
    setShowRoleSelector(false);
    return { success: true };
  };

  const logout = () => {
    setUser({
      id: 'usr-guest',
      email: 'visitor@psynova.lk',
      name: 'Guest Visitor',
      role: 'guest',
    });
  };

  // Initial load from NestJS backend API routes
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const [docsRes, bookingsRes, reviewsRes, complaintsRes, settingsRes, patientsRes] = await Promise.all([
          fetch('/api/psychiatrists'),
          fetch('/api/bookings'),
          fetch('/api/reviews'),
          fetch('/api/complaints'),
          fetch('/api/settings'),
          fetch('/api/patients'),
        ]);

        if (docsRes.ok) {
          const docs = await docsRes.json();
          if (Array.isArray(docs) && docs.length > 0) setPsychiatrists(docs);
        }
        if (bookingsRes.ok) {
          const bks = await bookingsRes.json();
          if (Array.isArray(bks)) setBookings(bks);
        }
        if (reviewsRes.ok) {
          const revs = await reviewsRes.json();
          if (Array.isArray(revs)) setReviews(revs);
        }
        if (complaintsRes.ok) {
          const cmps = await complaintsRes.json();
          if (Array.isArray(cmps)) setComplaints(cmps);
        }
        if (settingsRes.ok) {
          const stgs = await settingsRes.json();
          if (stgs) setPlatformSettings(stgs);
        }
        if (patientsRes.ok) {
          const pats = await patientsRes.json();
          if (Array.isArray(pats)) setPatients(pats);
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
          user,
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
  }, [user, psychiatrists, bookings, reviews, complaints, platformSettings, patients]);

  // Automated 5-minute pre-session SMS reminder scanner
  useEffect(() => {
    const scanAndDispatchReminders = async () => {
      const now = Date.now();
      const fiveMinsMs = 5 * 60 * 1000;

      for (const booking of bookings) {
        if (booking.status === 'confirmed' && !booking.reminder5MinSent) {
          const slotTime = new Date(booking.slotDatetime).getTime();
          const diff = slotTime - now;

          // If session starts in <= 5 mins (and hasn't passed more than 15 mins)
          if (diff > -15 * 60 * 1000 && diff <= fiveMinsMs) {
            try {
              await fetch('/api/sms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reminder-5min', booking }),
              });
              setBookings((prev) =>
                prev.map((b) => (b.id === booking.id ? { ...b, reminder5MinSent: true } : b))
              );
            } catch (e) {
              console.error('Automated 5-min SMS reminder error:', e);
            }
          }
        }
      }
    };

    const interval = setInterval(scanAndDispatchReminders, 15000);
    scanAndDispatchReminders();
    return () => clearInterval(interval);
  }, [bookings]);

  // Handle role selection
  const setUserRole = (role: UserRole) => {
    let newUser: User = {
      id: 'usr-1',
      email: 'user@psynova.lk',
      name: 'User',
      role,
    };

    if (role === 'patient') {
      const latestPatient = patients[0];
      if (latestPatient) {
        newUser = {
          id: latestPatient.id,
          email: latestPatient.email,
          name: latestPatient.name,
          role: 'patient',
          clientId: latestPatient.clientId,
        };
      } else {
        newUser = {
          id: `pat-${Date.now()}`,
          email: '',
          name: 'Patient User',
          role: 'patient',
          clientId: `PN-PAT-${Math.floor(10000 + Math.random() * 90000)}`,
        };
      }
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

  const addDoctorSlot = (
    doctorId: string,
    slot: { id: string; datetime: string; durationMins: number; status: 'available' }
  ) => {
    setPsychiatrists((prev) =>
      prev.map((doc) => {
        if (doc.id === doctorId) {
          return {
            ...doc,
            upcomingSlots: [slot, ...doc.upcomingSlots],
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

    // Sync booking to backend repository
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBooking),
    }).catch((e) => console.error('Booking backend sync error:', e));

    // Trigger automatic SMS confirmation after successful payment to the customer's phone number
    fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'booking-confirmation', booking: newBooking }),
    }).catch((err) => console.error('Auto SMS booking confirmation error:', err));

    fetch('/api/sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'doctor-alert', booking: newBooking }),
    }).catch((err) => console.error('Auto SMS doctor alert error:', err));

    return { success: true, booking: newBooking };
  };

  const addConfirmedBooking = (booking: Booking) => {
    setBookings((prev) => {
      const exists = prev.some((b) => b.id === booking.id);
      if (exists) {
        return prev.map((b) => (b.id === booking.id ? booking : b));
      }
      return [booking, ...prev];
    });

    if (booking.doctorId) {
      setPsychiatrists((prev) =>
        prev.map((d) => {
          if (d.id === booking.doctorId) {
            return {
              ...d,
              upcomingSlots: d.upcomingSlots.map((s) =>
                s.datetime === booking.slotDatetime ? { ...s, status: 'booked' } : s
              ),
            };
          }
          return d;
        })
      );
    }
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
        logout,
        loginUser,
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
        addDoctorSlot,
        createBooking,
        addConfirmedBooking,
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
