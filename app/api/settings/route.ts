import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return NextResponse.json(data ?? {
      user_id: user.id,
      target_monthly_housing_cost: 0,
      baseline_monthly_draw: 0,
      savings_floor: 0,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();

    const { data, error } = await supabase.from('user_settings').upsert({
      user_id: user.id,
      target_monthly_housing_cost: Number(body.target_monthly_housing_cost ?? 0),
      baseline_monthly_draw: Number(body.baseline_monthly_draw ?? 0),
      savings_floor: Number(body.savings_floor ?? 0),
      updated_at: new Date().toISOString(),
    }).select('*').single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
