import { Psychiatrist, BoostTier, DoctorStatus } from '../../lib/types';
import { initialPsychiatrists, initialPlatformSettings } from '../../lib/mockData';

export class PsychiatristsService {
  private psychiatrists: Psychiatrist[] = [...initialPsychiatrists];

  findAll(): Psychiatrist[] {
    return this.psychiatrists;
  }

  findOne(id: string): Psychiatrist {
    const doc = this.psychiatrists.find((d) => d.id === id);
    if (!doc) throw new Error(`Psychiatrist with ID ${id} not found`);
    return doc;
  }

  boost(doctorId: string, tier: BoostTier): { success: boolean; message: string; doctor?: Psychiatrist } {
    const currentlyBoostedCount = this.psychiatrists.filter((d) => d.isBoosted && d.id !== doctorId).length;
    if (currentlyBoostedCount >= initialPlatformSettings.maxBoostedDoctors) {
      throw new Error(
        `Boost limit reached! Maximum ${initialPlatformSettings.maxBoostedDoctors} psychiatrists can be boosted platform-wide.`
      );
    }

    const daysToAdd = tier === '1-day' ? 1 : 3;
    const expiry = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();

    let updatedDoctor: Psychiatrist | undefined;
    this.psychiatrists = this.psychiatrists.map((doc) => {
      if (doc.id === doctorId) {
        updatedDoctor = {
          ...doc,
          isBoosted: true,
          boostTier: tier,
          boostExpiry: expiry,
        };
        return updatedDoctor;
      }
      return doc;
    });

    return {
      success: true,
      message: `Doctor successfully boosted with ${tier} Crown package!`,
      doctor: updatedDoctor,
    };
  }

  unboost(doctorId: string): Psychiatrist {
    let updatedDoc: Psychiatrist | undefined;
    this.psychiatrists = this.psychiatrists.map((doc) => {
      if (doc.id === doctorId) {
        updatedDoc = {
          ...doc,
          isBoosted: false,
          boostTier: 'none',
          boostExpiry: null,
        };
        return updatedDoc;
      }
      return doc;
    });
    if (!updatedDoc) throw new Error(`Doctor not found`);
    return updatedDoc;
  }

  updateStatus(doctorId: string, status: DoctorStatus): Psychiatrist {
    let updatedDoc: Psychiatrist | undefined;
    this.psychiatrists = this.psychiatrists.map((doc) => {
      if (doc.id === doctorId) {
        updatedDoc = { ...doc, status };
        return updatedDoc;
      }
      return doc;
    });
    if (!updatedDoc) throw new Error(`Doctor not found`);
    return updatedDoc;
  }

  addDoctor(docData: Partial<Psychiatrist>): Psychiatrist {
    const newDoc: Psychiatrist = {
      id: `doc-${Date.now()}`,
      name: docData.name || 'Dr. New Doctor',
      title: docData.title || 'Consultant Psychiatrist',
      slmcRegNo: docData.slmcRegNo || 'SLMC-PENDING',
      status: 'pending',
      isBoosted: false,
      boostTier: 'none',
      boostExpiry: null,
      photo: docData.photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=600&auto=format&fit=crop',
      bio: docData.bio || 'New SLMC registered practitioner.',
      languages: docData.languages || ['English', 'Sinhala'],
      sessionFormats: docData.sessionFormats || ['Video Telehealth'],
      specialties: docData.specialties || ['General Psychiatry'],
      district: docData.district || 'Colombo',
      feeLkr: docData.feeLkr || 5000,
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

    this.psychiatrists = [newDoc, ...this.psychiatrists];
    return newDoc;
  }

  uploadDoc(doctorId: string, docName: string): Psychiatrist {
    let updatedDoc: Psychiatrist | undefined;
    this.psychiatrists = this.psychiatrists.map((doc) => {
      if (doc.id === doctorId) {
        const newFile = {
          id: `doc-file-${Date.now()}`,
          name: docName || 'SLMC_Qualification_Doc.pdf',
          url: '#',
          uploadDate: new Date().toISOString().split('T')[0],
          status: 'Pending' as const,
        };
        updatedDoc = { ...doc, documents: [newFile, ...doc.documents] };
        return updatedDoc;
      }
      return doc;
    });
    if (!updatedDoc) throw new Error(`Doctor not found`);
    return updatedDoc;
  }

  deleteDoc(doctorId: string, docId: string): Psychiatrist {
    let updatedDoc: Psychiatrist | undefined;
    this.psychiatrists = this.psychiatrists.map((doc) => {
      if (doc.id === doctorId) {
        updatedDoc = {
          ...doc,
          documents: doc.documents.filter((d) => d.id !== docId),
        };
        return updatedDoc;
      }
      return doc;
    });
    if (!updatedDoc) throw new Error(`Doctor not found`);
    return updatedDoc;
  }

  markSlotBooked(doctorId: string, slotId: string) {
    this.psychiatrists = this.psychiatrists.map((doc) => {
      if (doc.id === doctorId) {
        return {
          ...doc,
          upcomingSlots: doc.upcomingSlots.map((s) => (s.id === slotId ? { ...s, status: 'booked' } : s)),
        };
      }
      return doc;
    });
  }
}
