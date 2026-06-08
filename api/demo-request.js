// Serverless function to handle demo request submissions, store to Supabase, and send notifications via Resend.

module.exports = async (req, res) => {
  // Configure CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, company, email } = req.body;

  if (!name || !company || !email) {
    return res.status(400).json({ error: 'All fields (name, company, email) are required.' });
  }

  // Basic email formatting validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address format.' });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;

  let dbSaved = false;

  // 1. Store submission in Supabase demo_requests table
  if (supabaseUrl && supabaseKey) {
    try {
      const dbResponse = await fetch(`${supabaseUrl}/rest/v1/demo_requests`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          full_name: name,
          company_name: company,
          work_email: email
        })
      });

      if (!dbResponse.ok) {
        const errText = await dbResponse.text();
        console.error('Supabase DB Insert Error Response:', errText);
        throw new Error('Supabase insert rejected by database');
      }

      dbSaved = true;
    } catch (dbError) {
      console.error('Supabase REST Insert Failure:', dbError);
      return res.status(500).json({ error: 'Failed to write demo request to database.' });
    }
  } else {
    console.warn('Supabase environment variables are missing. Skipping DB persistence in serverless function.');
    // In local dev without keys, we fail database write, but if they are missing in production we should report.
    return res.status(500).json({ error: 'Database configuration missing.' });
  }

  // 2. Format Timestamp in IST
  const timestampIST = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) + ' (IST)';

  // 3. Send email via Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #1E293B;">
          <h2 style="color: #0F172A; border-bottom: 2px solid #00B5B5; padding-bottom: 8px;">New Demo Request — Navis</h2>
          <p>A new visitor has requested access to the Navis private preview platform:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">Full Name:</td>
              <td style="padding: 8px 0;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px 0; font-weight: bold;">Company Name:</td>
              <td style="padding: 8px 0;">${company}</td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px 0; font-weight: bold;">Work Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 8px 0; font-weight: bold;">Submitted At:</td>
              <td style="padding: 8px 0;">${timestampIST}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px;">
            Sent automatically by Navis Platform Backend.
          </p>
        </div>
      `;

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Navis Platform <onboarding@resend.dev>',
          to: 'sumitnayar@gmail.com',
          subject: 'New Demo Request — Navis',
          html: emailHtml
        })
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        console.error('Resend Email Send Failure:', errText);
      }
    } catch (emailError) {
      console.error('Resend API call crashed:', emailError);
      // We do not fail the request if the email sending failed but db insert succeeded,
      // because we still have the backup database record.
    }
  } else {
    console.warn('RESEND_API_KEY environment variable is not configured. Email notification skipped.');
  }

  return res.status(200).json({ success: true, message: 'Demo request received successfully.' });
};
