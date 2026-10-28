/**
 * Serverless Payment Order Creation Handler
 * Endpoint: /api/checkout/create-order
 * Communicates with Razorpay Orders API via backend server-side secret.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { productId, currency = 'INR' } = req.body || {};
  const rzpKeyId = process.env.RAZORPAY_KEY_ID;
  const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!rzpKeyId || !rzpKeySecret) {
    return res.status(503).json({
      error: 'Payment gateway is onboarding. Direct sales checkout available via contact@fullstopsolution.in'
    });
  }

  // Official price list verified on backend (prevents client-side price tampering)
  const CATALOG = {
    'business-os': { inr: 1499, usd: 19 },
    'growth-seo': { inr: 999, usd: 14 },
    'dev-boilerplate': { inr: 1999, usd: 25 },
    'lifetime-bundle': { inr: 3999, usd: 49 }
  };

  const item = CATALOG[productId];
  if (!item) {
    return res.status(400).json({ error: 'Unknown product requested' });
  }

  const amountPaise = (currency === 'INR' ? item.inr : item.usd) * 100;

  try {
    const authHeader = 'Basic ' + Buffer.from(`${rzpKeyId}:${rzpKeySecret}`).toString('base64');
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: currency === 'INR' ? 'INR' : 'USD',
        receipt: `rcpt_${Date.now()}`
      })
    });

    const orderData = await rzpRes.json();
    return res.status(200).json({
      orderId: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      keyId: rzpKeyId
    });
  } catch (err) {
    console.error('[Create Order Error]', err);
    return res.status(500).json({ error: 'Failed to initiate secure order' });
  }
}
