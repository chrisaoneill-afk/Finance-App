'use client';

import { useEffect, useMemo, useState } from 'react';

type Monthly = {
  month_key: string;
  inflows: number;
  outflows: number;
  net: number;
  deficit: number;
  surplus: number;
};

export default function DashboardPage() {
  const [summaries, setSummaries] = useState<Monthly[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [settings, setSettings] = useState({ target_monthly_housing_cost: 0, baseline_monthly_draw: 0 });

  useEffect(() => {
    Promise.all([fetch('/api/monthly-summary'), fetch('/api/settings')])
      .then(async ([summaryRes, settingsRes]) => {
        const summaryData = (await summaryRes.json()) as Monthly[];
        setSummaries(summaryData);
        if (summaryData.length) setSelectedMonth(summaryData[summaryData.length - 1].month_key);
        setSettings(await settingsRes.json());
      });
  }, []);

  const current = useMemo(() => summaries.find((m) => m.month_key === selectedMonth), [summaries, selectedMonth]);
  const baselineDraw = (settings.baseline_monthly_draw ?? 0) > 0
    ? Number(settings.baseline_monthly_draw)
    : Number(settings.target_monthly_housing_cost ?? 0);
  const deficit = Math.max(0, -(current?.net ?? 0));
  const surplus = Math.max(0, current?.net ?? 0);
  const recommendedDraw = Math.max(0, baselineDraw + deficit - surplus);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <section className="rounded bg-white p-4 shadow">
        <label className="text-sm">Month</label>
        <select className="ml-2 rounded border p-2" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          {summaries.map((s) => <option key={s.month_key} value={s.month_key}>{s.month_key}</option>)}
        </select>
      </section>

      {current && (
        <>
          <section className="grid gap-3 md:grid-cols-5">
            <Card title="Inflows" value={current.inflows} />
            <Card title="Outflows" value={current.outflows} />
            <Card title="Net" value={current.net} />
            <Card title="Deficit" value={current.deficit} />
            <Card title="Surplus" value={current.surplus} />
          </section>

          <section className="rounded bg-white p-4 shadow space-y-2">
            <h2 className="text-lg font-medium">Pay Myself Recommendation</h2>
            <p>Baseline draw for housing: ${baselineDraw.toFixed(2)}</p>
            <p>This month deficit coverage: ${deficit.toFixed(2)}</p>
            <p>This month surplus reduces draw by: ${surplus.toFixed(2)}</p>
            <p className="font-semibold">Recommended withdrawal from Backup Savings: ${recommendedDraw.toFixed(2)}</p>
          </section>

          <section className="rounded bg-white p-4 shadow">
            <h2 className="mb-3 text-lg font-medium">Net by Month</h2>
            <div className="space-y-2">
              {summaries.map((s) => (
                <div key={s.month_key} className="grid grid-cols-[90px_1fr_90px] items-center gap-2 text-sm">
                  <span>{s.month_key}</span>
                  <div className="h-3 rounded bg-slate-100">
                    <div
                      className={`h-3 rounded ${s.net >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(s.net) / 100)}%` }}
                    />
                  </div>
                  <span className="text-right">${s.net.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-xl font-semibold">${value.toFixed(2)}</p>
    </div>
  );
}
