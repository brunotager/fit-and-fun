import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { waitlistSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = waitlistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, userId, name } = parsed.data;

    // Upsert to avoid duplicates if user submits the same email twice
    const { error } = await supabase
      .from('waitlist')
      .upsert({
        email,
        user_id: userId || null,
        name: name || null,
        signed_up_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (error) {
      console.error('Waitlist insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Waitlist error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
