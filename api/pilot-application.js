// Vercel serverless function — receives pilot application form posts and
// relays them to pilots@margin.work via Resend, BCC'd to founders@margin.work.

const { Resend } = require('resend');

const REQUIRED_FIELDS = [
  'name',
  'business_name',
  'role',
  'location_count',
  'main_distributor',
  'weekly_invoice_volume',
  'timeline',
  'email',
];

const FIELD_LABELS = {
  name: 'Your name',
  business_name: 'Restaurant or bar name',
  role: 'Role',
  location_count: 'Locations',
  main_distributor: 'Main distributor today',
  weekly_invoice_volume: 'Weekly invoice volume',
  timeline: 'Timeline',
  email: 'Best email',
  phone: 'Best phone',
  notes: 'Anything else I should know?',
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const missing = REQUIRED_FIELDS.filter((f) => !String(body[f] || '').trim());
  if (missing.length) {
    return res.status(400).json({ error: `Missing required field(s): ${missing.join(', ')}` });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim());
  if (!emailOk) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const to = process.env.PILOT_INBOX || 'pilots@margin.work';
  const from = process.env.PILOT_FROM || 'MarginOS <notifications@margin.work>';
  const bcc = 'founders@margin.work';

  const rows = Object.keys(FIELD_LABELS)
    .filter((k) => body[k])
    .map(
      (k) =>
        `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#475569;font-size:13px;white-space:nowrap;">${esc(FIELD_LABELS[k])}</td><td style="padding:6px 0;vertical-align:top;color:#0f172a;font-size:14px;">${esc(body[k]).replace(/\n/g, '<br>')}</td></tr>`
    )
    .join('');

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;max-width:560px;">
      <h2 style="font-size:18px;color:#0f172a;margin:0 0 4px;">New pilot application</h2>
      <p style="color:#475569;font-size:13px;margin:0 0 16px;">${esc(body.business_name)} &middot; ${esc(body.location_count)} location(s) &middot; ${esc(body.timeline)}</p>
      <table style="border-collapse:collapse;width:100%;">${rows}</table>
      <p style="color:#64748b;font-size:12px;margin-top:20px;">Reply directly to this email to respond to ${esc(body.name)}.</p>
    </div>
  `;

  const text = Object.keys(FIELD_LABELS)
    .filter((k) => body[k])
    .map((k) => `${FIELD_LABELS[k]}: ${body[k]}`)
    .join('\n');

  const subject = `Pilot application — ${body.business_name} (${body.location_count} locations)`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      bcc,
      reply_to: String(body.email).trim(),
      subject,
      html,
      text,
    });
    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Failed to send application' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('pilot-application handler error:', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
};
