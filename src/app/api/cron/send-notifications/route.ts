import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import webpush from 'web-push';

// Vercel Cron calls this route daily
// Cron secret prevents unauthorized access
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  webpush.setVapidDetails(
    'mailto:brunotager@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  // Get current UTC hour to match reminder times
  const now = new Date();
  const currentHour = now.getUTCHours().toString().padStart(2, '0');
  const currentMinute = now.getUTCMinutes().toString().padStart(2, '0');
  // We'll send to anyone whose reminder_time matches the current hour (±30 min window)
  // For simplicity, we just fetch all subscriptions and check
  
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (error || !subscriptions) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 });
  }

  const messages = [
    "Time for today's workout! Coach Gabi is waiting 🐧",
    "Your streak is calling! Let's keep it going 🔥",
    "5 minutes is all it takes. You've got this! 💪",
    "Hey! Don't forget your daily workout 🏃",
    "Coach Gabi misses you! Ready to crush it? 🎯",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    const pushSubscription = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.keys_p256dh,
        auth: sub.keys_auth,
      },
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: 'Fit & Fun',
          body: randomMessage,
          url: '/workouts',
        })
      );
      sent++;
    } catch (err: any) {
      failed++;
      // If subscription is invalid (410 Gone), remove it
      if (err.statusCode === 410 || err.statusCode === 404) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', sub.user_id);
      }
      console.error(`Push failed for user ${sub.user_id}:`, err.statusCode);
    }
  }

  return NextResponse.json({ sent, failed, total: subscriptions.length });
}
