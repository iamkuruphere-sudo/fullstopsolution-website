/**
 * Serverless Lead Generation & Download Event Handler
 * Endpoint: /api/lead
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { productId, productName, customerEmail } = req.body || {};

    if (!customerEmail || !customerEmail.includes('@')) {
      return res.status(400).json({ error: 'Valid email required.' });
    }

    console.info('[Lead Captured]', {
      productId,
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server Error' });
  }
}
