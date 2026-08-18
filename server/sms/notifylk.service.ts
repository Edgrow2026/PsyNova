import { Booking, SmsLog } from '../../lib/types';

export class NotifyLkService {
  private userId: string = process.env.NOTIFYLK_USER_ID || process.env.SMSWAY_USER_ID || '';
  private apiKey: string = process.env.NOTIFYLK_API_KEY || process.env.SMSWAY_API_KEY || '';
  private senderId: string = process.env.NOTIFYLK_SENDER_ID || process.env.SMSWAY_SENDER_ID || 'NotifyDEMO';
  private apiUrl: string = process.env.NOTIFYLK_API_URL || 'https://app.notify.lk/api/v1/send';
  private smsLogs: SmsLog[] = [];

  getLogs(): SmsLog[] {
    return this.smsLogs;
  }

  formatSriLankaPhone(phone: string): { cleanDigits: string; displayFormat: string } {
    if (!phone) {
      return { cleanDigits: '94770000000', displayFormat: '+94 77 000 0000' };
    }
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) {
      digits = '94' + digits.substring(1);
    } else if (digits.length === 9 && digits.startsWith('7')) {
      digits = '94' + digits;
    } else if (!digits.startsWith('94')) {
      digits = '94' + digits;
    }

    const displayFormat = `+${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
    return { cleanDigits: digits, displayFormat };
  }

  async sendSms(recipientPhone: string, message: string): Promise<{ success: boolean; messageId: string; status: string; log: SmsLog }> {
    const { cleanDigits, displayFormat } = this.formatSriLankaPhone(recipientPhone);
    const msgId = `NOTIFYLK-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    console.log(`[Notify.lk] Dispatching SMS to ${cleanDigits} (${displayFormat}) via Sender ID '${this.senderId}': "${message}"`);

    let logStatus: SmsLog['status'] = 'SIMULATED';
    let statusCode: number | undefined;
    let apiResponse: any = null;
    let errorNote: string | undefined;

    if (this.apiKey && this.userId) {
      try {
        // Construct request to Notify.lk API
        const url = new URL(this.apiUrl);
        url.searchParams.append('user_id', this.userId);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('sender_id', this.senderId);
        url.searchParams.append('to', cleanDigits);
        url.searchParams.append('message', message);

        const response = await fetch(url.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
        });

        statusCode = response.status;
        const rawText = await response.text();
        try {
          apiResponse = JSON.parse(rawText);
        } catch {
          apiResponse = rawText;
        }

        const isApiSuccess = response.ok && (
          apiResponse?.status === 'success' ||
          apiResponse?.code === 200 ||
          apiResponse?.success === true
        );

        if (isApiSuccess) {
          logStatus = 'DELIVERED';
          console.log(`[Notify.lk] Message DELIVERED to telco network. Ref: ${msgId}`);
        } else {
          logStatus = 'FAILED';
          errorNote = apiResponse?.message || apiResponse?.error || `HTTP ${response.status} Notify.lk gateway error`;
          console.error(`[Notify.lk] Delivery FAILED (${response.status}):`, errorNote);
        }
      } catch (err: any) {
        logStatus = 'FAILED';
        errorNote = `Network/Fetch Exception: ${err.message}`;
        console.error('[Notify.lk] Network error:', err);
      }
    } else {
      logStatus = 'SIMULATED';
      errorNote = 'NOTIFYLK_USER_ID or NOTIFYLK_API_KEY environment variable not set. Simulated local SMS log recorded.';
      console.log(`[Notify.lk] SIMULATED dispatch recorded to ${cleanDigits}`);
    }

    const logEntry: SmsLog = {
      id: msgId,
      recipient: cleanDigits,
      formattedRecipient: displayFormat,
      senderId: this.senderId,
      message,
      status: logStatus,
      statusCode,
      apiResponse,
      timestamp,
      errorNote,
    };

    this.smsLogs = [logEntry, ...this.smsLogs];

    return {
      success: logStatus === 'DELIVERED' || logStatus === 'SIMULATED',
      messageId: msgId,
      status: logStatus,
      log: logEntry,
    };
  }

  async sendBookingConfirmation(booking: Booking): Promise<any> {
    const formattedDate = new Date(booking.slotDatetime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const msg = `PsyNova LK: Booking ${booking.id} CONFIRMED! Specialist: ${booking.doctorName}. Date & Time: ${formattedDate}. Fee LKR ${booking.feeLkr.toLocaleString()} paid via PayHere. Join Video Session: ${booking.videoLink}`;
    return this.sendSms(booking.patientContact, msg);
  }

  async sendDoctorAlert(booking: Booking, doctorPhone?: string): Promise<any> {
    const phone = doctorPhone || '+94773849100';
    const formattedDate = new Date(booking.slotDatetime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const msg = `PsyNova Alert: New consultation booked by ${booking.patientName} for ${formattedDate}. Ref: ${booking.id}. Telehealth link: ${booking.videoLink}`;
    return this.sendSms(phone, msg);
  }

  async send5MinReminder(booking: Booking): Promise<any> {
    const formattedTime = new Date(booking.slotDatetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const msg = `PsyNova REMINDER: Your Telehealth Consultation with ${booking.doctorName} starts in 5 minutes (${formattedTime}). Click to join video room: ${booking.videoLink}`;
    return this.sendSms(booking.patientContact, msg);
  }

  async sendJitsiReminder(booking: Booking, targetPhone: string, role: 'patient' | 'psychiatrist'): Promise<any> {
    const msg = `PsyNova Reminder: Your ${role === 'patient' ? 'Psychiatry' : 'Patient'} Video Consultation is ready on Jitsi. Click to join: ${booking.videoLink}`;
    return this.sendSms(targetPhone, msg);
  }
}

// Export SmsWayService alias for backwards compatibility
export const SmsWayService = NotifyLkService;
