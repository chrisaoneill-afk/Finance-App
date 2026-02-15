import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const accountId = searchParams.get('account_id');
    const page = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('page_size') ?? 25);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('transactions')
      .select('id,date,description,amount,month_key,account_id,accounts(name)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (month) query = query.eq('month_key', month);
    if (accountId) query = query.eq('account_id', accountId);

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return NextResponse.json({ rows: data ?? [], total: count ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
