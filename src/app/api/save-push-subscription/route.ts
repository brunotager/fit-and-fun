import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const saveSchema = z.object({
  userId: z.string().uuid(),
  endpoint: z.string().url().max(2000),
  keysP256dh: z.string().max(500),
  keysAuth: z.string().max(500),
  reminderTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
});

const deleteSchema = z.object({
  userId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = saveSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { userId, endpoint, keysP256dh, keysAuth, reminderTime } = parsed.data;

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint,
        keys_p256dh: keysP256dh,
        keys_auth: keysAuth,
        reminder_time: reminderTime,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Save push subscription error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Save push subscription error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', parsed.data.userId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete push subscription error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
