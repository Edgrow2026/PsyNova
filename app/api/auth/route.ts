import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';
import { validateEmail, validatePassword } from '../../../lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { databaseService } = await getNestServices();
    const body = await req.json();

    const role = body.role || 'patient';

    if (body.action === 'signup') {
      const email = (body.email || body.emailOrPhone || '').trim();
      const password = body.password || '';
      const name = body.fullName || body.name || email.split('@')[0] || 'Registered Patient';

      const emailVal = validateEmail(email);
      if (!emailVal.isValid) {
        return NextResponse.json({ error: emailVal.error }, { status: 400 });
      }

      const passVal = validatePassword(password);
      if (!passVal.isValid) {
        return NextResponse.json({ error: passVal.error }, { status: 400 });
      }

      const patient = await databaseService.createPatient({
        name,
        email,
        phone: body.phone || body.contact || '',
        district: body.district || 'Colombo',
        password,
      });

      return NextResponse.json({
        success: true,
        user: {
          id: patient.id,
          email: patient.email,
          name: patient.name,
          role: 'patient',
          clientId: patient.clientId,
        },
      });
    }

    // Sign In logic
    const email = (body.email || body.emailOrPhone || '').trim();
    const password = body.password || '';

    const emailVal = validateEmail(email);
    if (!emailVal.isValid) {
      return NextResponse.json({ error: emailVal.error }, { status: 400 });
    }

    if (role === 'psychiatrist') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'usr-doc1',
          email,
          name: 'Dr. Ananda Wickramasinghe',
          role: 'psychiatrist',
          slmcRegNo: 'SLMC-38491',
          doctorId: 'doc-1',
        },
      });
    }

    if (role === 'admin') {
      return NextResponse.json({
        success: true,
        user: {
          id: 'adm-1',
          email,
          name: 'System Platform Admin',
          role: 'admin',
        },
      });
    }

    // Patient login check in PostgreSQL database
    const allPatients = await databaseService.getAllPatients();
    const found = allPatients.find((p) => p.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      return NextResponse.json(
        { error: 'No registered account found with this email. Please check your email or Sign Up.' },
        { status: 404 }
      );
    }

    if (found.password && password && found.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password for this email account. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: found.id,
        email: found.email,
        name: found.name,
        role: 'patient',
        clientId: found.clientId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

