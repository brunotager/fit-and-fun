import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncUserSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // S4: Validate input
    const parsed = syncUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, name, joinDate, goalType, lastActiveDay, heightPrimary, heightSecondary, heightUnit, weight, weightUnit, notificationsEnabled, waitlistEmail, connectedDevice } = parsed.data;

    // Build the upsert payload, stripping null/undefined fields
    const upsertData: Record<string, any> = {
      id,
      name,
      join_date: joinDate,
      updated_at: new Date().toISOString(),
    };

    if (goalType != null) upsertData.goal_type = goalType;
    if (lastActiveDay != null) upsertData.last_active_day = lastActiveDay;
    if (heightPrimary != null) upsertData.height_primary = heightPrimary;
    if (heightSecondary != null) upsertData.height_secondary = heightSecondary;
    if (heightUnit != null) upsertData.height_unit = heightUnit;
    if (weight != null) upsertData.weight = weight;
    if (weightUnit != null) upsertData.weight_unit = weightUnit;
    if (notificationsEnabled != null) upsertData.notifications_enabled = notificationsEnabled;
    if (waitlistEmail != null) upsertData.waitlist_email = waitlistEmail;
    if (connectedDevice != null) upsertData.connected_device = connectedDevice;

    const { error } = await supabase
      .from('users')
      .upsert(upsertData, { onConflict: 'id' });

    if (error) {
      console.error('Supabase users error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Sync user error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
