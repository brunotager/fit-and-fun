import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, joinDate, goalType, fitnessGoal, activityLevel, lastActiveDay } = body;

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
