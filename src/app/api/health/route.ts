import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    // Ping Supabase with a lightweight query
    const { error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    checks.supabase = error ? `error: ${error.message}` : 'ok';
  } catch (err) {
    checks.supabase = 'unreachable';
  }

  const allOk = Object.values(checks).every(v => v === 'ok');

  return NextResponse.json(
    { status: allOk ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allOk ? 200 : 503 }
  );
}
