import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deactivateUserSchema } from '@/lib/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = deactivateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { id } = parsed.data;

    // Mark user as deactivated instead of deleting (D1)
    // Data can be purged after 90 days via a scheduled Supabase function
    const { error } = await supabase
      .from('users')
      .update({ deactivated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Deactivate user error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Deactivate user error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
