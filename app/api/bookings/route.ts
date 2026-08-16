import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export async function GET(req: NextRequest) {
  try {
    const { bookingsService } = await getNestServices();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const booking = bookingsService.findOne(id);
      return NextResponse.json(booking);
    }

    return NextResponse.json(bookingsService.findAll());
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 404 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { bookingsService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'create-pending') {
      const res = bookingsService.createPendingBooking(body);
      return NextResponse.json(res);
    } else if (body.action === 'cancel') {
      const res = bookingsService.cancelBooking(body.bookingId, body.note);
      return NextResponse.json(res);
    } else if (body.action === 'complete') {
      const res = bookingsService.completeBooking(body.bookingId);
      return NextResponse.json(res);
    } else if (body.action === 'payout') {
      const res = bookingsService.markPayoutPaid(body.bookingId);
      return NextResponse.json(res);
    }

    const res = bookingsService.createBooking(body);
    return NextResponse.json(res);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Booking creation failed' }, { status: 400 });
  }
}
