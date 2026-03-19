import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  const { name, email, message } = await request.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Siskiyou Farmstead <hello@siskiyoufarmstead.com>',
      to: ['hello@siskiyoufarmstead.com'],
      replyTo: email,
      subject: `Contact Form: ${name}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #2d2d2d;">New Contact Form Message</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: 1px solid #e8e4dc;" />
          <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
        </div>
      `,
    });
    return NextResponse.json({ success: true, message: 'Message sent successfully!' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to send message. Please try again.';
    console.error('Contact error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
