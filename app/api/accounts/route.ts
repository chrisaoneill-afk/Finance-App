import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET() {
  try {
    const { supabase, user } = await requireUser();
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();

    const payload = {
      user_id: user.id,
      name: body.name,
      institution: body.institution || null,
      type: body.type,
      is_backup_savings: Boolean(body.is_backup_savings),
    };

    const { data, error } = await supabase.from('accounts').insert(payload).select('*').single();
    if (error) throw error;

    if (payload.is_backup_savings) {
      await supabase.from('accounts').update({ is_backup_savings: false }).eq('user_id', user.id).neq('id', data.id);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();

    const { data, error } = await supabase
      .from('accounts')
      .update({
        name: body.name,
        institution: body.institution || null,
        type: body.type,
        is_backup_savings: Boolean(body.is_backup_savings),
      })
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) throw error;

    if (body.is_backup_savings) {
      await supabase.from('accounts').update({ is_backup_savings: false }).eq('user_id', user.id).neq('id', body.id);
      await supabase.from('accounts').update({ is_backup_savings: true }).eq('id', body.id).eq('user_id', user.id);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
