import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export async function GET() {
  try {
    const { databaseService } = await getNestServices();
    const patients = await databaseService.getAllPatients();
    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { databaseService } = await getNestServices();
    const body = await req.json();

    if (!body.email || !body.name) {
      return NextResponse.json({ error: 'Name and email are required for patient registration' }, { status: 400 });
    }

    const patient = await databaseService.createPatient(body);
    return NextResponse.json(patient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
