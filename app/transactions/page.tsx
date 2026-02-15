'use client';

import { useEffect, useMemo, useState } from 'react';

type Txn = {
  id: string;
  date: string;
  description: string;
  amount: number;
  month_key: string;
  account_id: string;
  accounts: { name: string } | null;
};

type Account = { id: string; name: string };

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const [rows, setRows] = useState<Txn[]>([]);
  const [month, setMonth] = useState('');
  const [accountId, setAccountId] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadAccounts() {
    const res = await fetch('/api/accounts');
    setAccounts(await res.json());
  }

  async function loadTransactions() {
    const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
    if (month) params.set('month', month);
    if (accountId) params.set('account_id', accountId);

    const res = await fetch(`/api/transactions?${params.toString()}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
  }

  useEffect(() => { loadAccounts(); }, []);
  useEffect(() => { loadTransactions(); }, [page, month, accountId]);

  const monthTotals = useMemo(() => {
    const inflows = rows.filter((r) => r.amount > 0).reduce((sum, r) => sum + Number(r.amount), 0);
    const net = rows.reduce((sum, r) => sum + Number(r.amount), 0);
    const outflows = Math.abs(rows.filter((r) => r.amount < 0).reduce((sum, r) => sum + Number(r.amount), 0));
    return { inflows, outflows, net };
  }, [rows]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <section className="rounded bg-white p-4 shadow space-y-3">
        <div className="grid gap-2 md:grid-cols-3">
          <input className="rounded border p-2" type="month" value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }} />
          <select className="rounded border p-2" value={accountId} onChange={(e) => { setAccountId(e.target.value); setPage(1); }}>
            <option value="">All accounts</option>
            {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </div>
        <div className="grid gap-2 md:grid-cols-3 text-sm">
          <p>Inflows: ${monthTotals.inflows.toFixed(2)}</p>
          <p>Outflows: ${monthTotals.outflows.toFixed(2)}</p>
          <p>Net: ${monthTotals.net.toFixed(2)}</p>
        </div>
      </section>

      <section className="rounded bg-white p-4 shadow overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Account</th>
              <th className="border p-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="border p-2">{row.date}</td>
                <td className="border p-2">{row.description}</td>
                <td className="border p-2">{row.accounts?.name ?? '-'}</td>
                <td className="border p-2 text-right">${Number(row.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex items-center justify-between">
          <button className="rounded border px-3 py-1" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <p className="text-sm">Page {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}</p>
          <button className="rounded border px-3 py-1" onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)}>Next</button>
        </div>
      </section>
    </div>
  );
}
