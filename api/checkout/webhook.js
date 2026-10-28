/**
 * Serverless Payment Webhook Handler (Razorpay & Gateways)
 * Endpoint: /api/checkout/webhook
 * Verifies webhook signature and updates transactional state.
 */

import crypto from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSignature || !webhookSecret) {
    return res.status(401).send('Missing webhook signature verification parameters');
  }

  // Verify HMAC signature
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(webhookSignature, 'utf8'),
    Buffer.from(expectedSignature, 'utf8')
  );

  if (!isValid) {
    console.warn('[Security Alert] Invalid webhook signature detected.');
    return res.status(400).send('Invalid Signature');
  }

  const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  console.info('[Webhook Event Received]', { event: event.event, id: event.payload?.payment?.entity?.id });

  return res.status(200).json({ status: 'ok' });
}
