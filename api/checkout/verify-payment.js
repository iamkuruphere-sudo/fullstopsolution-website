/**
 * Serverless Payment Verification & License Fulfillment Handler
 * Endpoint: /api/checkout/verify-payment
 * Enforces constant-time cryptographic HMAC-SHA256 signature validation.
 */

import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { paymentId, orderId, signature, productId, customerEmail } = req.body || {};
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    return res.status(503).json({
      verified: false,
      message: 'Server verification secret offline. Order queued for manual administrative review.'
    });
  }

  if (!paymentId || !orderId || !signature) {
    return res.status(400).json({ verified: false, error: 'Incomplete payment signature payload.' });
  }

  // Validate HMAC SHA-256
  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  );

  if (!isValid) {
    console.warn('[Security Alert] Payment signature tampering attempt detected:', { paymentId, orderId });
    return res.status(400).json({ verified: false, error: 'Cryptographic signature mismatch.' });
  }

  // Generate cryptographically random production license key
  const randSegment = () => crypto.randomBytes(3).toString('hex').toUpperCase();
  const licenseKey = `FS-${randSegment()}-${randSegment()}-${randSegment()}-${randSegment()}`;

  console.info('[Payment Verified]', {
    paymentId,
    orderId,
    productId,
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({
    verified: true,
    licenseKey: licenseKey,
    message: 'Payment verified successfully.'
  });
}
