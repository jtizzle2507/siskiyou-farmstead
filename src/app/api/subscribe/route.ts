import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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
      to: [email],
      subject: 'Welcome to Siskiyou Farmstead!',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2d5a3a; text-align: center;">Welcome to Siskiyou Farmstead!</h1>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Thank you for signing up for our newsletter! You'll be the first to know about:
          </p>
          <ul style="color: #333; font-size: 16px; line-height: 1.8;">
            <li>Fresh product availability</li>
            <li>Seasonal specials and new offerings</li>
            <li>Delivery schedule updates</li>
            <li>Farm news and events</li>
          </ul>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            We're passionate about bringing you the freshest greens and mushrooms grown right here in Siskiyou County.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://siskiyoufarmstead.com/shop"
               style="background: linear-gradient(135deg, #7c6a46 0%, #5a4a2a 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Shop Now
            </a>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
            Siskiyou Farmstead &bull; Siskiyou County, CA
          </p>
        </div>
      `,
    });

    // Save subscriber to Supabase
    try {
      const supabase = createServerSupabase();
      await supabase.from('farm_subscribers').upsert({ email, active: true });
    } catch (subErr) {
      console.error('Failed to save subscriber to Supabase:', subErr);
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to subscribe. Please try again.';
    console.error('Subscribe error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
