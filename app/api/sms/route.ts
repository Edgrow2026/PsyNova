import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export async function GET() {
  try {
    const { smsWayService } = await getNestServices();
    return NextResponse.json({
      senderId: process.env.SMSWAY_SENDER_ID || 'PsyNovaLK',
      hasApiKey: !!process.env.SMSWAY_API_KEY,
      logs: smsWayService.getLogs(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { smsWayService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'test') {
      const recipient = body.recipient || '94770000000';
      const res = await smsWayService.sendSms(
        recipient,
        `PsyNova LK Test: SMSWay.lk gateway connection verified for ${recipient}. Telehealth SMS notifications active.`
      );
      return NextResponse.json(res);
    } else if (body.action === 'reminder-5min') {
      if (body.booking) {
        const res = await smsWayService.send5MinReminder(body.booking);
        return NextResponse.json(res);
      }
      const res = await smsWayService.sendSms(
        body.recipient,
        `PsyNova REMINDER: Your Psychiatry Consultation with ${body.doctorName || 'your specialist'} starts in 5 minutes. Join video room: ${body.videoLink || 'https://meet.psynova.lk'}`
      );
      return NextResponse.json(res);
    } else if (body.action === 'booking-confirmation') {
      if (body.booking) {
        const res = await smsWayService.sendBookingConfirmation(body.booking);
        return NextResponse.json(res);
      }
    } else if (body.action === 'doctor-alert') {
      if (body.booking) {
        const res = await smsWayService.sendDoctorAlert(body.booking);
        return NextResponse.json(res);
      }
    }

    const res = await smsWayService.sendSms(body.recipient, body.message);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'SMS dispatch failed' }, { status: 400 });
  }
}
