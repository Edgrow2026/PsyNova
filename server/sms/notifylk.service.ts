import { Booking, SmsLog } from '../../lib/types';

export class NotifyLkService {
  private smsLogs: SmsLog[] = [];

  getLogs(): SmsLog[] {
    return this.smsLogs;
  }

  private getCredentials() {
    const userId =
      process.env.NOTIFYLK_USER_ID ||
      process.env.NOTIFY_LK_USER_ID ||
      process.env.NOTIFY_USER_ID ||
      process.env.NOTIFYLK_USERID ||
      process.env.SMSWAY_USER_ID ||
      '';

    const apiKey =
      process.env.NOTIFYLK_API_KEY ||
      process.env.NOTIFY_LK_API_KEY ||
      process.env.NOTIFY_API_KEY ||
      process.env.NOTIFYLK_APIKEY ||
      process.env.SMSWAY_API_KEY ||
      '';

    const senderId =
      process.env.NOTIFYLK_SENDER_ID ||
      process.env.NOTIFY_LK_SENDER_ID ||
      process.env.NOTIFY_SENDER_ID ||
      process.env.SMSWAY_SENDER_ID ||
      'NotifyDEMO';

    const apiUrl =
      process.env.NOTIFYLK_API_URL ||
      process.env.NOTIFY_LK_API_URL ||
      process.env.NOTIFY_API_URL ||
      'https://app.notify.lk/api/v1/send';

    return {
      userId: userId.trim(),
      apiKey: apiKey.trim(),
      senderId: senderId.trim() || 'NotifyDEMO',
      apiUrl: apiUrl.trim() || 'https://app.notify.lk/api/v1/send',
    };
  }

  formatSriLankaPhone(phone: string): { cleanDigits: string; displayFormat: string } {
    if (!phone) {
      return { cleanDigits: '94770000000', displayFormat: '+94 77 000 0000' };
    }
    // Strip all non-numeric characters
    let digits = phone.replace(/[^0-9]/g, '');

    // Normalize common Sri Lankan phone input variations:
    if (digits.startsWith('940') && digits.length === 12) {
      // E.g. "+94 077 123 4567" -> "94771234567"
      digits = '94' + digits.substring(3);
    } else if (digits.startsWith('0') && digits.length === 10) {
      // E.g. "0771234567" -> "94771234567"
      digits = '94' + digits.substring(1);
    } else if (digits.length === 9) {
      // E.g. "771234567" -> "94771234567"
      digits = '94' + digits;
    } else if (!digits.startsWith('94')) {
      digits = '94' + digits;
    }

    const displayFormat = digits.length >= 11
      ? `+${digits.substring(0, 2)} ${digits.substring(2, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`
      : `+${digits}`;

    return { cleanDigits: digits, displayFormat };
  }

  async sendSms(
    recipientPhone: string,
    message: string
  ): Promise<{ success: boolean; messageId: string; status: string; log: SmsLog; error?: string }> {
    const { cleanDigits, displayFormat } = this.formatSriLankaPhone(recipientPhone);
    const msgId = `NOTIFYLK-${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();
    const { userId, apiKey, senderId, apiUrl } = this.getCredentials();

    console.log(`[Notify.lk] Dispatching SMS to ${cleanDigits} (${displayFormat}) via Sender '${senderId}': "${message}"`);

    let logStatus: SmsLog['status'] = 'SIMULATED';
    let statusCode: number | undefined;
    let apiResponse: any = null;
    let errorNote: string | undefined;

    if (apiKey && userId) {
      try {
        // Construct standard POST application/x-www-form-urlencoded body for Notify.lk
        const formParams = new URLSearchParams();
        formParams.append('user_id', userId);
        formParams.append('api_key', apiKey);
        formParams.append('sender_id', senderId);
        formParams.append('to', cleanDigits);
        formParams.append('message', message);

        let response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          body: formParams.toString(),
        });

        statusCode = response.status;
        let rawText = await response.text();

        // If POST fails or is rejected, attempt GET query format as documented in Notify.lk API
        if (!response.ok && response.status !== 401 && response.status !== 403) {
          try {
            const getUrl = new URL(apiUrl);
            getUrl.searchParams.append('user_id', userId);
            getUrl.searchParams.append('api_key', apiKey);
            getUrl.searchParams.append('sender_id', senderId);
            getUrl.searchParams.append('to', cleanDigits);
            getUrl.searchParams.append('message', message);

            const getRes = await fetch(getUrl.toString(), {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
            });
            if (getRes.ok) {
              response = getRes;
              statusCode = getRes.status;
              rawText = await getRes.text();
            }
          } catch (getErr) {
            console.warn('[Notify.lk] GET fallback exception:', getErr);
          }
        }

        try {
          apiResponse = JSON.parse(rawText);
        } catch {
          apiResponse = { raw: rawText };
        }

        console.log(`[Notify.lk] Gateway response (HTTP ${statusCode}):`, apiResponse);

        const isApiSuccess = (response.ok || statusCode === 200) && (
          apiResponse?.status === 'success' ||
          apiResponse?.status === 'sent' ||
          apiResponse?.status === 'queued' ||
          apiResponse?.code === 200 ||
          apiResponse?.success === true ||
          (typeof apiResponse?.data === 'string' && apiResponse.data.toLowerCase().includes('sent'))
        );

        if (isApiSuccess) {
          logStatus = 'DELIVERED';
          console.log(`[Notify.lk] Message DELIVERED to telco network. Ref: ${msgId}`);
        } else {
          logStatus = 'FAILED';
          errorNote =
            apiResponse?.message ||
            apiResponse?.data ||
            apiResponse?.error ||
            (typeof apiResponse?.raw === 'string' && apiResponse.raw.length > 0 ? apiResponse.raw : `HTTP ${statusCode} Notify.lk Gateway Error`);
          console.error(`[Notify.lk] Delivery FAILED (${statusCode}):`, errorNote);
        }
      } catch (err: any) {
        logStatus = 'FAILED';
        errorNote = `Network/Fetch Exception: ${err.message}`;
        console.error('[Notify.lk] Network error:', err);
      }
    } else {
      logStatus = 'SIMULATED';
      errorNote = 'NOTIFYLK_USER_ID or NOTIFYLK_API_KEY environment variable is not configured. Add NOTIFYLK_USER_ID and NOTIFYLK_API_KEY to your environment variables to send live SMS via Notify.lk.';
      console.log(`[Notify.lk] SIMULATED dispatch recorded to ${cleanDigits}. Reason: Missing credentials in environment`);
    }

    const logEntry: SmsLog = {
      id: msgId,
      recipient: cleanDigits,
      formattedRecipient: displayFormat,
      senderId,
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
      error: errorNote,
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
    const recipient = booking.patientContact || '+94771234567';
    const msg = `PsyNova LK: Booking ${booking.id} CONFIRMED! Specialist: ${booking.doctorName}. Date: ${formattedDate}. Fee LKR ${booking.feeLkr.toLocaleString()} paid via PayHere. Join Video Session: ${booking.videoLink || 'https://meet.psynova.lk'}`;
    return this.sendSms(recipient, msg);
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
    const msg = `PsyNova Alert: New consultation booked by ${booking.patientName} for ${formattedDate}. Ref: ${booking.id}. Telehealth link: ${booking.videoLink || 'https://meet.psynova.lk'}`;
    return this.sendSms(phone, msg);
  }

  async send5MinReminder(booking: Booking): Promise<any> {
    const formattedTime = new Date(booking.slotDatetime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const recipient = booking.patientContact || '+94771234567';
    const msg = `PsyNova REMINDER: Your Telehealth Consultation with ${booking.doctorName} starts in 5 minutes (${formattedTime}). Click to join video room: ${booking.videoLink || 'https://meet.psynova.lk'}`;
    return this.sendSms(recipient, msg);
  }

  async sendJitsiReminder(booking: Booking, targetPhone: string, role: 'patient' | 'psychiatrist'): Promise<any> {
    const msg = `PsyNova Reminder: Your ${role === 'patient' ? 'Psychiatry' : 'Patient'} Video Consultation is ready on Jitsi. Click to join: ${booking.videoLink || 'https://meet.psynova.lk'}`;
    return this.sendSms(targetPhone, msg);
  }
}

// Export SmsWayService alias for backwards compatibility
export const SmsWayService = NotifyLkService;
