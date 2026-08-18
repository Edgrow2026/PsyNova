import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export async function GET() {
  try {
    const { notifyLkService, smsWayService } = await getNestServices();
    const smsService = notifyLkService || smsWayService;
    return NextResponse.json({
      senderId: process.env.NOTIFYLK_SENDER_ID || process.env.SMSWAY_SENDER_ID || 'NotifyDEMO',
      hasApiKey: !!(process.env.NOTIFYLK_API_KEY || process.env.SMSWAY_API_KEY),
      hasUserId: !!(process.env.NOTIFYLK_USER_ID || process.env.SMSWAY_USER_ID),
      logs: smsService.getLogs(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { notifyLkService, smsWayService } = await getNestServices();
    const smsService = notifyLkService || smsWayService;
    const body = await req.json();

    if (body.action === 'test') {
      const recipient = body.recipient || '94770000000';
      const res = await smsService.sendSms(
        recipient,
        `PsyNova LK Test: Notify.lk gateway connection verified for ${recipient}. Telehealth SMS notifications active.`
      );
      return NextResponse.json(res);
    } else if (body.action === 'reminder-5min') {
      if (body.booking) {
        const res = await smsService.send5MinReminder(body.booking);
        return NextResponse.json(res);
      }
      const res = await smsService.sendSms(
        body.recipient,
        `PsyNova REMINDER: Your Psychiatry Consultation with ${body.doctorName || 'your specialist'} starts in 5 minutes. Join video room: ${body.videoLink || 'https://meet.psynova.lk'}`
      );
      return NextResponse.json(res);
    } else if (body.action === 'booking-confirmation') {
      if (body.booking) {
        const res = await smsService.sendBookingConfirmation(body.booking);
        return NextResponse.json(res);
      }
    } else if (body.action === 'doctor-alert') {
      if (body.booking) {
        const res = await smsService.sendDoctorAlert(body.booking);
        return NextResponse.json(res);
      }
    }

    const res = await smsService.sendSms(body.recipient, body.message);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'SMS dispatch failed' }, { status: 400 });
  }
}
