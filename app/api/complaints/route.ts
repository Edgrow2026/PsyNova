import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { complaintsService } = await getNestServices();
    return NextResponse.json(complaintsService.findAll());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { complaintsService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'resolve') {
      const res = complaintsService.resolveComplaint(body.complaintId, body.proofUrl, body.note);
      return NextResponse.json(res);
    }

    const complaint = complaintsService.addComplaint(body.bookingId, body.reason, body.details, body.patientName);
    return NextResponse.json(complaint);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
