import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const FROM_EMAIL = 'Pruv <notifications@pruv.app>'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { voucheeName, voucheeEmail, voucherName, message, newScore, weight } = await req.json()

    if (!voucheeEmail || !voucheeName || !voucherName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been vouched!</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:#1a7a4a;padding:32px 36px 24px;">
      <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Pruv</p>
      <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.75);">Nigeria's trust network</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 36px;">
      <div style="font-size:40px;margin-bottom:16px;">🎉</div>
      <h1 style="margin:0 0 12px;font-size:22px;color:#0f1f14;font-weight:700;line-height:1.3;">
        ${voucherName} just vouched for you!
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
        Hi ${voucheeName}, someone in your network has vouched for you on Pruv. Your trust score just went up!
      </p>

      ${message ? `
      <!-- Vouch message -->
      <div style="background:#f0faf5;border-left:4px solid #2ecc8a;border-radius:0 8px 8px 0;padding:16px 18px;margin-bottom:24px;">
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#1a7a4a;text-transform:uppercase;letter-spacing:0.5px;">What they said</p>
        <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.65;font-style:italic;">"${message}"</p>
      </div>
      ` : ''}

      <!-- Score badge -->
      <div style="background:#f0faf5;border-radius:12px;padding:18px 20px;margin-bottom:28px;display:flex;align-items:center;gap:16px;">
        <div style="background:#1a7a4a;color:white;border-radius:50%;width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex-shrink:0;text-align:center;line-height:52px;">${newScore || '+'}</div>
        <div>
          <p style="margin:0 0 3px;font-size:13px;color:#666;">Trust score update</p>
          <p style="margin:0;font-size:15px;font-weight:600;color:#0f1f14;">+${weight} points added → now at <strong>${newScore}</strong></p>
        </div>
      </div>

      <!-- CTA -->
      <a href="https://pruv.app/profile" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:24px;">
        View your profile →
      </a>

      <p style="margin:20px 0 0;font-size:13px;color:#999;line-height:1.6;">
        The more people trust you on Pruv, the more opportunities come your way. Keep building your reputation! 🙌
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;border-top:1px solid #eee;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
        You received this because someone vouched for you on <a href="https://pruv.app" style="color:#1a7a4a;text-decoration:none;">Pruv</a>. 
        To manage your notification preferences, visit your account settings.
      </p>
    </div>
  </div>
</body>
</html>`

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [voucheeEmail],
        subject: `${voucherName} vouched for you on Pruv 🎉`,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Resend error:', data)
      return new Response(JSON.stringify({ error: data }), { status: 500 })
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
