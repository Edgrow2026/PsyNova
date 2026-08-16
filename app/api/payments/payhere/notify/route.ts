import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../../../server/nest-app';

export async function POST(req: NextRequest) {
  try {
    const { payHereService, bookingsService, smsWayService } = await getNestServices();

    let body: any = {};
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      try {
        body = await req.json();
      } catch {
        const text = await req.text();
        const params = new URLSearchParams(text);
        body = Object.fromEntries(params.entries());
      }
    }

    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
      status_message,
    } = body;

    console.log(`[PayHere Webhook Notify] Received callback for order_id: ${order_id}, status_code: ${status_code}`);

    // Verify MD5 Signature strictly
    const isValidHash = payHereService.verifyNotificationHash({
      merchant_id: merchant_id || '',
      order_id: order_id || '',
      payhere_amount: payhere_amount || 0,
      payhere_currency: payhere_currency || 'LKR',
      status_code: status_code ?? '',
      md5sig: md5sig || '',
    });

    if (!isValidHash) {
      console.error(`[PayHere Webhook Notify] Security Alert: MD5 Signature hash mismatch for order ${order_id}!`);
      return NextResponse.json(
        { error: 'MD5 signature verification failed. Notification rejected.' },
        { status: 400 }
      );
    }

    const result = bookingsService.verifyAndConfirmPayHerePayment(
      order_id,
      payment_id || `PAYHERE-${Math.floor(1000000 + Math.random() * 9000000)}`,
      status_code,
      status_message || `PayHere callback verified with status_code ${status_code}`
    );

    if (result.success && result.isNewlyConfirmed) {
      try {
        await smsWayService.sendBookingConfirmation(result.booking);
        await smsWayService.sendDoctorAlert(result.booking);
        console.log(`[PayHere Webhook Notify] Booking ${order_id} confirmed & SMS notifications dispatched via SMSWay.lk`);
      } catch (smsErr) {
        console.error('[PayHere Webhook Notify] SMS dispatch error:', smsErr);
      }
    }

    return NextResponse.json({
      verified: true,
      statusCode: status_code,
      paymentStatus: result.booking.paymentStatus,
      bookingStatus: result.booking.status,
      message: result.success
        ? 'Payment verified and booking confirmed successfully.'
        : `Payment status updated: ${result.statusText} (status_code ${status_code})`,
      booking: result.booking,
    });
  } catch (error: any) {
    console.error('[PayHere Webhook Notify] Handler error:', error);
    return NextResponse.json({ error: error.message || 'Webhook processing failed' }, { status: 500 });
  }
}
