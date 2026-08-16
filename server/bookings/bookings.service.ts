import { Booking } from '../../lib/types';
import { initialBookings, initialPlatformSettings } from '../../lib/mockData';
import { PsychiatristsService } from '../psychiatrists/psychiatrists.service';

export class BookingsService {
  private bookings: Booking[] = [...initialBookings];

  constructor(private readonly psychiatristsService: PsychiatristsService) {}

  findAll(): Booking[] {
    return this.bookings;
  }

  findOne(id: string): Booking {
    const booking = this.bookings.find((b) => b.id === id);
    if (!booking) throw new Error(`Booking ${id} not found`);
    return booking;
  }

  createPendingBooking(data: {
    orderId?: string;
    doctorId: string;
    slotId: string;
    slotDatetime: string;
    patientName: string;
    patientEmail: string;
    patientContact: string;
    patientId?: string;
  }): { success: boolean; booking: Booking } {
    const doctor = this.psychiatristsService.findOne(data.doctorId);
    const slot = doctor.upcomingSlots.find((s) => s.id === data.slotId);

    if (!slot || slot.status === 'booked') {
      throw new Error('This consultation slot is no longer available.');
    }

    const fee = doctor.feeLkr;
    const commission = Math.round(fee * (initialPlatformSettings.commissionRate / 100));
    const netDoctor = fee - commission;
    const bookingId = data.orderId || `BK-${Math.floor(10000 + Math.random() * 90000)}`;

    const pendingBooking: Booking = {
      id: bookingId,
      patientId: data.patientId || 'pat-1',
      patientName: data.patientName || 'Patient',
      patientEmail: data.patientEmail || 'patient@example.lk',
      patientContact: data.patientContact,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorPhoto: doctor.photo,
      slotDatetime: data.slotDatetime,
      feeLkr: fee,
      platformCommissionLkr: commission,
      netDoctorEarningLkr: netDoctor,
      status: 'pending',
      paymentStatus: 'pending',
      payhereRef: 'AWAITING_PAYHERE_WEBHOOK',
      videoLink: `https://meet.psynova.lk/room/PN-CONF-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: 'pending', timestamp: new Date().toISOString(), note: 'Awaiting PayHere gateway payment notification' },
      ],
    };

    // Keep booking in list
    const existingIdx = this.bookings.findIndex((b) => b.id === bookingId);
    if (existingIdx >= 0) {
      this.bookings[existingIdx] = pendingBooking;
    } else {
      this.bookings = [pendingBooking, ...this.bookings];
    }

    return { success: true, booking: pendingBooking };
  }

  verifyAndConfirmPayHerePayment(
    orderId: string,
    payherePaymentId: string,
    statusCode: number | string,
    note?: string
  ): { success: boolean; statusText: 'success' | 'pending' | 'failed'; isNewlyConfirmed: boolean; booking: Booking } {
    const codeNum = Number(statusCode);
    let booking = this.bookings.find((b) => b.id === orderId);

    if (!booking) {
      // Auto-create booking record on the fly so webhook/simulation never fails
      const allDoctors = this.psychiatristsService.findAll();
      const doctor = allDoctors[0];
      const fee = doctor ? doctor.feeLkr : 6000;
      const commission = Math.round(fee * (initialPlatformSettings.commissionRate / 100));

      booking = {
        id: orderId,
        patientId: 'pat-1',
        patientName: 'Dilshan Silva',
        patientEmail: 'dilshan.silva@example.lk',
        patientContact: '+94 77 123 4567',
        doctorId: doctor ? doctor.id : 'doc-1',
        doctorName: doctor ? doctor.name : 'Dr. Ananda Jayawardena',
        doctorPhoto: doctor ? doctor.photo : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
        slotDatetime: new Date(Date.now() + 86400000).toISOString(),
        feeLkr: fee,
        platformCommissionLkr: commission,
        netDoctorEarningLkr: fee - commission,
        status: 'pending',
        paymentStatus: 'pending',
        payhereRef: 'AWAITING_PAYHERE_WEBHOOK',
        videoLink: `https://meet.psynova.lk/room/PN-CONF-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date().toISOString(),
        statusHistory: [
          { status: 'pending', timestamp: new Date().toISOString(), note: 'Created via PayHere gateway callback' },
        ],
      };
      this.bookings = [booking, ...this.bookings];
    }

    if (codeNum === 2) {
      const isNewlyConfirmed = booking.status !== 'confirmed' || booking.paymentStatus !== 'paid';
      const updatedBooking: Booking = {
        ...booking,
        status: 'confirmed',
        paymentStatus: 'paid',
        payhereRef: payherePaymentId || booking.payhereRef || `PAYHERE-${Math.floor(1000000 + Math.random() * 9000000)}`,
        statusHistory: [
          ...booking.statusHistory,
          {
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            note: note || `Payment verified via PayHere webhook (status_code 2, Ref: ${payherePaymentId})`,
          },
        ],
      };

      // Mark slot booked
      try {
        const doctor = this.psychiatristsService.findOne(booking.doctorId);
        const matchingSlot = doctor.upcomingSlots.find((s) => s.datetime === booking.slotDatetime);
        if (matchingSlot) {
          this.psychiatristsService.markSlotBooked(doctor.id, matchingSlot.id);
        }
      } catch (e) {
        console.warn('Slot booking status update note:', e);
      }

      this.bookings = this.bookings.map((b) => (b.id === orderId ? updatedBooking : b));

      return {
        success: true,
        statusText: 'success',
        isNewlyConfirmed,
        booking: updatedBooking,
      };
    } else if (codeNum === 0) {
      const updatedBooking: Booking = {
        ...booking,
        status: 'pending',
        paymentStatus: 'pending',
        statusHistory: [
          ...booking.statusHistory,
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: note || 'PayHere payment pending authorization (status_code 0)',
          },
        ],
      };
      this.bookings = this.bookings.map((b) => (b.id === orderId ? updatedBooking : b));
      return { success: false, statusText: 'pending', isNewlyConfirmed: false, booking: updatedBooking };
    } else {
      // Code -1 (Cancelled), -2 (Failed), -3 (Chargedback)
      const updatedBooking: Booking = {
        ...booking,
        status: 'cancelled',
        paymentStatus: 'failed',
        statusHistory: [
          ...booking.statusHistory,
          {
            status: 'cancelled',
            timestamp: new Date().toISOString(),
            note: note || `PayHere payment declined/cancelled (status_code ${statusCode})`,
          },
        ],
      };
      this.bookings = this.bookings.map((b) => (b.id === orderId ? updatedBooking : b));
      return { success: false, statusText: 'failed', isNewlyConfirmed: false, booking: updatedBooking };
    }
  }

  createBooking(data: {
    doctorId: string;
    slotId: string;
    slotDatetime: string;
    patientName: string;
    patientEmail: string;
    patientContact: string;
    patientId?: string;
  }): { success: boolean; booking: Booking } {
    const doctor = this.psychiatristsService.findOne(data.doctorId);
    const slot = doctor.upcomingSlots.find((s) => s.id === data.slotId);

    if (!slot || slot.status === 'booked') {
      throw new Error('This consultation slot is no longer available.');
    }

    const fee = doctor.feeLkr;
    const commission = Math.round(fee * (initialPlatformSettings.commissionRate / 100));
    const netDoctor = fee - commission;

    const newBooking: Booking = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      patientId: data.patientId || 'pat-1',
      patientName: data.patientName || 'Patient',
      patientEmail: data.patientEmail || 'patient@example.lk',
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

    this.psychiatristsService.markSlotBooked(doctor.id, data.slotId);
    this.bookings = [newBooking, ...this.bookings];

    return { success: true, booking: newBooking };
  }

  cancelBooking(id: string, note?: string): Booking {
    let updated: Booking | undefined;
    this.bookings = this.bookings.map((b) => {
      if (b.id === id) {
        updated = {
          ...b,
          status: 'cancelled',
          statusHistory: [
            ...b.statusHistory,
            { status: 'cancelled', timestamp: new Date().toISOString(), note: note || 'Cancelled by user/admin' },
          ],
        };
        return updated;
      }
      return b;
    });
    if (!updated) throw new Error('Booking not found');
    return updated;
  }

  completeBooking(id: string): Booking {
    let updated: Booking | undefined;
    this.bookings = this.bookings.map((b) => {
      if (b.id === id) {
        updated = {
          ...b,
          status: 'completed',
          paymentStatus: b.paymentStatus === 'paid' ? 'payout_pending' : b.paymentStatus,
          statusHistory: [
            ...b.statusHistory,
            { status: 'completed', timestamp: new Date().toISOString(), note: 'Consultation completed' },
          ],
        };
        return updated;
      }
      return b;
    });
    if (!updated) throw new Error('Booking not found');
    return updated;
  }

  markPayoutPaid(id: string): Booking {
    let updated: Booking | undefined;
    this.bookings = this.bookings.map((b) => {
      if (b.id === id) {
        updated = {
          ...b,
          paymentStatus: 'payout_completed',
        };
        return updated;
      }
      return b;
    });
    if (!updated) throw new Error('Booking not found');
    return updated;
  }
}
