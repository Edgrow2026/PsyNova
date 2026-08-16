import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../server/nest-app';

export async function GET() {
  try {
    const { reviewsService } = await getNestServices();
    return NextResponse.json(reviewsService.findAll());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { reviewsService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'helpful') {
      const res = reviewsService.voteHelpful(body.reviewId);
      return NextResponse.json(res);
    } else if (body.action === 'flag') {
      const res = reviewsService.flagReview(body.reviewId, body.note);
      return NextResponse.json(res);
    }

    const review = reviewsService.addReview(body.doctorId, body.rating, body.text, body.patientName);
    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
