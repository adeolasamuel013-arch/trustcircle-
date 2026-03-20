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
    const { receiverName, receiverEmail, senderName, messagePreview, senderId } = await req.json()

    if (!receiverEmail || !receiverName || !senderName) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    // Truncate preview for email safety
    const preview = messagePreview?.length > 160
      ? messagePreview.substring(0, 157) + '...'
      : messagePreview

    const chatUrl = `https://pruv.app/messages/${senderId}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New message on Pruv</title>
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
      <div style="font-size:40px;margin-bottom:16px;">💬</div>
      <h1 style="margin:0 0 12px;font-size:22px;color:#0f1f14;font-weight:700;line-height:1.3;">
        New message from ${senderName}
      </h1>
      <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.7;">
        Hi ${receiverName}, you have a new message waiting for you on Pruv.
      </p>

      ${preview ? `
      <!-- Message preview -->
      <div style="background:#f7f7f7;border:1px solid #eaeaea;border-radius:12px;padding:18px 20px;margin-bottom:28px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.5px;">${senderName} says</p>
        <p style="margin:0;font-size:15px;color:#1a1a2e;line-height:1.65;">${preview}</p>
      </div>
      ` : ''}

      <!-- CTA -->
      <a href="${chatUrl}" style="display:inline-block;background:#1a7a4a;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin-bottom:24px;">
        Reply to ${senderName} →
      </a>

      <p style="margin:20px 0 0;font-size:13px;color:#999;line-height:1.6;">
        Connecting with verified professionals is what Pruv is all about. Don't keep them waiting! ⚡
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:20px 36px;border-top:1px solid #eee;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
        You received this because someone messaged you on <a href="https://pruv.app" style="color:#1a7a4a;text-decoration:none;">Pruv</a>. 
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
        to: [receiverEmail],
        subject: `${senderName} sent you a message on Pruv 💬`,
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
