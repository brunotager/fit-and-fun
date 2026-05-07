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

    const { id, name, joinDate, goalType, fitnessGoal, activityLevel, lastActiveDay, heightPrimary, heightSecondary, heightUnit, weight, weightUnit } = parsed.data;

    const { error } = await supabase
      .from('users')
      .upsert({
        id,
        name,
        join_date: joinDate,
        goal_type: goalType,
        fitness_goal: fitnessGoal,
        activity_level: activityLevel,
        last_active_day: lastActiveDay,
        height_primary: heightPrimary,
        height_secondary: heightSecondary,
        height_unit: heightUnit,
        weight: weight,
        weight_unit: weightUnit,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

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
