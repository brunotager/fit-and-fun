import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, date, type, duration, points, completionType, workoutId } = body;

    const { error } = await supabase
      .from('workouts')
      .insert({
        id,
        user_id: userId,
        date,
        type,
        duration,
        points,
        completion_type: completionType,
        workout_id: workoutId
      });

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
