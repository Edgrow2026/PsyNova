import { NextRequest, NextResponse } from 'next/server';
import { getNestServices } from '../../../../server/nest-app';

export async function GET() {
  try {
    const { payHereService } = await getNestServices();
    return NextResponse.json(payHereService.getPayHereConfig());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { payHereService, bookingsService, smsWayService } = await getNestServices();
    const body = await req.json();

    if (body.action === 'hash') {
      const hash = payHereService.generateHash(body.orderId, body.amount, body.currency || 'LKR');
      return NextResponse.json({ orderId: body.orderId, amount: body.amount, currency: body.currency || 'LKR', hash });
    } else if (body.action === 'checkout-params') {
      const forwardedHost = req.headers.get('x-forwarded-host');
      const originHeader = req.headers.get('origin');
      const hostHeader = req.headers.get('host');
      const proto = req.headers.get('x-forwarded-proto') || 'https';

      let baseUrl = body.baseUrl;
      if (!baseUrl || baseUrl.includes('localhost')) {
        if (forwardedHost && !forwardedHost.includes('localhost')) {
          baseUrl = `${proto}://${forwardedHost}`;
        } else if (originHeader && !originHeader.includes('localhost')) {
          baseUrl = originHeader;
        } else if (hostHeader && !hostHeader.includes('localhost')) {
          baseUrl = `${proto}://${hostHeader}`;
        }
      }

      const params = payHereService.createCheckoutParams({ ...body, baseUrl });
      return NextResponse.json(params);
    } else if (body.action === 'simulate-notify') {
      const orderId = body.orderId;
      const statusCode = body.statusCode !== undefined ? body.statusCode : 2;
      const amount = body.amount || 5000;
      const currency = 'LKR';
      const config = payHereService.getPayHereConfig();
      const paymentId = `PAYHERE-${Math.floor(1000000 + Math.random() * 9000000)}`;

      // Calculate valid MD5 signature according to PayHere formula:
      // MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret))
      const formattedAmount = Number(amount).toFixed(2);
      const secretHash = require('crypto')
        .createHash('md5')
        .update(process.env.PAYHERE_MERCHANT_SECRET || 'MjY0OTE2MjMyMjE2NzkwMjc2NDAxMjkxOTEwOTIzMTk5NzM4MzQ=')
        .digest('hex')
        .toUpperCase();

      const raw = `${config.merchantId}${orderId}${formattedAmount}${currency}${statusCode}${secretHash}`;
      const md5sig = require('crypto').createHash('md5').update(raw).digest('hex').toUpperCase();

      const simulateBody = {
        merchant_id: config.merchantId,
        order_id: orderId,
        payment_id: paymentId,
        payhere_amount: formattedAmount,
        payhere_currency: currency,
        status_code: statusCode,
        md5sig,
        status_message: statusCode === 2 ? 'Successfully paid via PayHere' : `PayHere code ${statusCode}`,
      };

      // Call webhook verification
      const isValid = payHereService.verifyNotificationHash(simulateBody);
      if (!isValid) {
        return NextResponse.json({ error: 'Simulated hash creation mismatch' }, { status: 400 });
      }

      const result = bookingsService.verifyAndConfirmPayHerePayment(
        orderId,
        paymentId,
        statusCode,
        `Simulated PayHere notify callback (status_code ${statusCode})`
      );

      if (result.success && result.isNewlyConfirmed) {
        await smsWayService.sendBookingConfirmation(result.booking);
        await smsWayService.sendDoctorAlert(result.booking);
      }

      return NextResponse.json({
        simulated: true,
        verified: true,
        statusCode,
        booking: result.booking,
        statusText: result.statusText,
      });
    }

    const isValid = payHereService.verifyNotificationHash(body);
    if (isValid && body.order_id) {
      const statusCode = body.status_code;
      const result = bookingsService.verifyAndConfirmPayHerePayment(
        body.order_id,
        body.payment_id || `PAYHERE-${Date.now()}`,
        statusCode,
        `PayHere Gateway IPN Callback (status_code ${statusCode})`
      );
      if (result.success && result.isNewlyConfirmed) {
        await smsWayService.sendBookingConfirmation(result.booking);
        await smsWayService.sendDoctorAlert(result.booking);
      }
      return NextResponse.json({ status: 'PROCESSED', verified: true, booking: result.booking });
    }
    return NextResponse.json({ verified: isValid });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'PayHere request failed' }, { status: 400 });
  }
}
