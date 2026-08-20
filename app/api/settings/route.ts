import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { settingsService } = await getNestServices();
    return NextResponse.json(settingsService.getSettings());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { settingsService } = await getNestServices();
    const body = await req.json();
    const settings = settingsService.updateSettings(body);
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
