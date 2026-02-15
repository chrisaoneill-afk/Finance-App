import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    let query = supabase
      .from('transactions')
      .select('amount,month_key')
      .eq('user_id', user.id);

    if (month) query = query.eq('month_key', month);

    const { data, error } = await query;
    if (error) throw error;

    const grouped = new Map<string, number[]>();
    for (const row of data ?? []) {
      const arr = grouped.get(row.month_key) ?? [];
      arr.push(Number(row.amount));
      grouped.set(row.month_key, arr);
    }

    const results = [...grouped.entries()].map(([monthKey, amounts]) => {
      const inflows = amounts.filter((a) => a > 0).reduce((acc, curr) => acc + curr, 0);
      const negativesTotal = amounts.filter((a) => a < 0).reduce((acc, curr) => acc + curr, 0);
      const outflows = Math.abs(negativesTotal);
      const net = inflows + negativesTotal;
      return {
        month_key: monthKey,
        inflows,
        outflows,
        net,
        deficit: Math.max(0, -net),
        surplus: Math.max(0, net),
      };
    }).sort((a, b) => a.month_key.localeCompare(b.month_key));

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
