import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export async function POST(req: NextRequest) {
  try {
    const { authService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'signup') {
      const res = authService.signUp(body.role, body);
      return NextResponse.json(res);
    }

    const res = authService.signIn(body.role, body.emailOrPhone);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
