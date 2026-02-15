import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { buildFingerprint, monthKeyFromDate, normalizeDescription } from '@/lib/import/normalize';

type ImportRow = { date: string; description: string; amount: number };

export async function POST(request: NextRequest) {
  try {
    const { supabase, user } = await requireUser();
    const body = await request.json();

    const accountId = String(body.account_id);
    const rows = body.rows as ImportRow[];

    const inserts = rows.map((row) => ({
      user_id: user.id,
      account_id: accountId,
      date: row.date,
      description: row.description,
      amount: Number(row.amount),
      month_key: monthKeyFromDate(row.date),
      fingerprint: buildFingerprint({
        userId: user.id,
        accountId,
        date: row.date,
        amount: Number(row.amount),
        description: normalizeDescription(row.description),
      }),
    }));

    const { error } = await supabase
      .from('transactions')
      .upsert(inserts, { onConflict: 'user_id,fingerprint', ignoreDuplicates: true });

    if (error) throw error;

    return NextResponse.json({ imported: inserts.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
