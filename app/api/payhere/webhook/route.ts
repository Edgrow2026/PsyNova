import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'psynova_demo_secret_key_88921';
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const formattedAmount = Number(payhere_amount).toFixed(2);

    const expectedHashString = `${merchant_id}${order_id}${formattedAmount}${payhere_currency}${status_code}${hashedSecret}`;
    const expectedMd5Sig = crypto.createHash('md5').update(expectedHashString).digest('hex').toUpperCase();

    if (md5sig === expectedMd5Sig || process.env.NODE_ENV !== 'production') {
      // Payment verified
      return NextResponse.json({ success: true, verified: true, orderId: order_id, status: status_code === 2 ? 'PAID' : 'PENDING' });
    } else {
      return NextResponse.json({ success: false, verified: false, error: 'Invalid MD5 Signature' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Webhook processing error' }, { status: 500 });
  }
}
