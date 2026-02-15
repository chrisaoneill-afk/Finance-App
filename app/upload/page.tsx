'use client';

import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { normalizeRows } from '@/lib/import/normalize';

type Account = { id: string; name: string; type: string };

type CsvRow = Record<string, string>;

export default function UploadPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState('');
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [dateColumn, setDateColumn] = useState('');
  const [descriptionColumn, setDescriptionColumn] = useState('');
  const [amountColumn, setAmountColumn] = useState('');
  const [invertAmountSign, setInvertAmountSign] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/accounts').then((r) => r.json()).then((data) => {
      setAccounts(data);
      setAccountId(data[0]?.id ?? '');
    });
  }, []);

  function onFile(file: File) {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete(result) {
        const parsedRows = result.data;
        setRows(parsedRows);
        const cols = Object.keys(parsedRows[0] ?? {});
        setColumns(cols);
        setDateColumn(cols[0] ?? '');
        setDescriptionColumn(cols[1] ?? '');
        setAmountColumn(cols[2] ?? '');
      },
    });
  }

  const preview = useMemo(() => rows.slice(0, 20), [rows]);

  async function onImport() {
    const normalized = normalizeRows({ rows, dateColumn, descriptionColumn, amountColumn, invertAmountSign });
    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_id: accountId, rows: normalized }),
    });
    const data = await res.json();
    setMessage(data.error ? `Error: ${data.error}` : `Imported ${data.imported} rows.`);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Upload Statements</h1>
      <section className="rounded bg-white p-4 shadow space-y-3">
        <select className="rounded border p-2" value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>{account.name}</option>
          ))}
        </select>
        <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        {!!columns.length && (
          <div className="grid gap-2 md:grid-cols-4">
            <select className="rounded border p-2" value={dateColumn} onChange={(e) => setDateColumn(e.target.value)}>{columns.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select className="rounded border p-2" value={descriptionColumn} onChange={(e) => setDescriptionColumn(e.target.value)}>{columns.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select className="rounded border p-2" value={amountColumn} onChange={(e) => setAmountColumn(e.target.value)}>{columns.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <label className="flex items-center gap-2 rounded border p-2">
              <input type="checkbox" checked={invertAmountSign} onChange={(e) => setInvertAmountSign(e.target.checked)} />
              My CSV has debits as positive
            </label>
          </div>
        )}
        <button className="rounded bg-slate-900 px-3 py-2 text-white" onClick={onImport} disabled={!rows.length || !accountId}>Import</button>
        {message ? <p className="text-sm">{message}</p> : null}
      </section>

      {preview.length > 0 && (
        <section className="rounded bg-white p-4 shadow overflow-auto">
          <h2 className="mb-2 font-medium">Preview (first 20 rows)</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr>{columns.map((col) => <th key={col} className="border p-2 text-left">{col}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((row, index) => (
                <tr key={index}>
                  {columns.map((col) => <td key={col} className="border p-2">{row[col]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
