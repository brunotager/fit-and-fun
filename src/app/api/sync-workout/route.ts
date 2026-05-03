import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { syncWorkoutSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // S4: Validate input
    const parsed = syncWorkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { id, userId, date, type, duration, points, completionType, workoutId } = parsed.data;

    // D2: Use upsert instead of insert for idempotency
    const { error } = await supabase
      .from('workouts')
      .upsert({
        id,
        user_id: userId,
        date,
        type,
        duration,
        points,
        completion_type: completionType,
        workout_id: workoutId
      }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase workouts error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Sync workout error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
