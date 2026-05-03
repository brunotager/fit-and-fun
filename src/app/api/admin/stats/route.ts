import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // S1: Read secret from Authorization header instead of query params
    const authHeader = request.headers.get('authorization');
    const secret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!secret || secret !== process.env.ADMIN_SECRET_CODE) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch users with limit (E2)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .is('deactivated_at', null)
      .order('join_date', { ascending: false })
      .limit(100);

    if (usersError) throw usersError;

    // Fetch workouts with limit (E2)
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .limit(500);

    if (workoutsError) throw workoutsError;

    // Calculate completion rate
    const timerFinished = workouts.filter(w => w.completion_type === 'timer_finished').length;
    const completionRate = workouts.length > 0 ? (timerFinished / workouts.length) * 100 : 0;

    return NextResponse.json({
      users,
      workouts,
      stats: {
        totalUsers: users.length,
        totalWorkouts: workouts.length,
        completionRate: Math.round(completionRate)
      }
    });

  } catch (err: any) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
