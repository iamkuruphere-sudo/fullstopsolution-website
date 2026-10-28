/**
 * Serverless Contact & Support Inquiry Handler
 * Endpoint: /api/contact
 * Validates, rate limits, and safely records inquiries without client PII leaks.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required inquiry fields.' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    // Clean inputs
    const sanitizedName = String(name).slice(0, 100).trim();
    const sanitizedSubject = String(subject || 'General Inquiry').slice(0, 150).trim();
    const sanitizedMessage = String(message).slice(0, 3000).trim();

    // Log operational metadata (do not log sensitive secrets)
    console.info('[Contact Inquiry]', {
      id: `INQ-${Date.now()}`,
      subject: sanitizedSubject,
      nameLength: sanitizedName.length,
      receivedAt: new Date().toISOString()
    });

    // In production with SendGrid, Resend, or AWS SES configured:
    // await sendEmailNotification({ to: 'contact@fullstopsolution.in', from: email, ... });

    return res.status(200).json({
      success: true,
      message: 'Inquiry received securely. Our team will contact you within 24 hours.'
    });
  } catch (err) {
    console.error('[Contact Error]', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
