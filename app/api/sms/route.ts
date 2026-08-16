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
      const res = await smsWayService.sendSms(
        body.recipient || '+94771234567',
        'PsyNova LK Test: SMSWay.lk gateway connection verified. Telehealth SMS notifications active.'
      );
      return NextResponse.json(res);
    }

    const res = await smsWayService.sendSms(body.recipient, body.message);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'SMS dispatch failed' }, { status: 400 });
  }
}
