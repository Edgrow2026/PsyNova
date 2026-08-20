import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { psychiatristsService } = await getNestServices();
    const data = psychiatristsService.findAll();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch psychiatrists' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { psychiatristsService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'boost') {
      const res = psychiatristsService.boost(body.doctorId, body.tier);
      return NextResponse.json(res);
    } else if (body.action === 'unboost') {
      const res = psychiatristsService.unboost(body.doctorId);
      return NextResponse.json(res);
    } else if (body.action === 'uploadDoc') {
      const res = psychiatristsService.uploadDoc(body.doctorId, body.docName);
      return NextResponse.json(res);
    } else if (body.action === 'deleteDoc') {
      const res = psychiatristsService.deleteDoc(body.doctorId, body.docId);
      return NextResponse.json(res);
    }

    const doc = psychiatristsService.addDoctor(body);
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { psychiatristsService } = await getNestServices();
    const body = await req.json();
    const doc = psychiatristsService.updateStatus(body.doctorId, body.status);
    return NextResponse.json(doc);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Update failed' }, { status: 400 });
  }
}
