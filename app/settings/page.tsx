'use client';

import { FormEvent, useEffect, useState } from 'react';

type Account = {
  id: string;
  name: string;
  institution: string | null;
  type: 'bank' | 'credit' | 'savings';
  is_backup_savings: boolean;
};

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [settings, setSettings] = useState({ target_monthly_housing_cost: 0, baseline_monthly_draw: 0, savings_floor: 0 });
  const [newAccount, setNewAccount] = useState({ name: '', institution: '', type: 'bank', is_backup_savings: false });

  async function load() {
    const [accountsRes, settingsRes] = await Promise.all([fetch('/api/accounts'), fetch('/api/settings')]);
    setAccounts(await accountsRes.json());
    setSettings(await settingsRes.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    await load();
  }

  async function addAccount(event: FormEvent) {
    event.preventDefault();
    await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAccount),
    });
    setNewAccount({ name: '', institution: '', type: 'bank', is_backup_savings: false });
    await load();
  }

  async function deleteAccount(id: string) {
    await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' });
    await load();
  }

  async function setBackup(id: string) {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;
    await fetch('/api/accounts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...account, is_backup_savings: true }),
    });
    await load();
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <section className="rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-medium">Housing + Draw Config</h2>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={saveSettings}>
          <input className="rounded border p-2" type="number" placeholder="Target monthly housing cost" value={settings.target_monthly_housing_cost}
            onChange={(e) => setSettings((prev) => ({ ...prev, target_monthly_housing_cost: Number(e.target.value) }))} />
          <input className="rounded border p-2" type="number" placeholder="Baseline monthly draw" value={settings.baseline_monthly_draw}
            onChange={(e) => setSettings((prev) => ({ ...prev, baseline_monthly_draw: Number(e.target.value) }))} />
          <input className="rounded border p-2" type="number" placeholder="Savings floor" value={settings.savings_floor}
            onChange={(e) => setSettings((prev) => ({ ...prev, savings_floor: Number(e.target.value) }))} />
          <button className="rounded bg-slate-900 p-2 text-white md:col-span-3" type="submit">Save Settings</button>
        </form>
      </section>

      <section className="rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-medium">Accounts</h2>
        <form className="mb-4 grid gap-2 md:grid-cols-4" onSubmit={addAccount}>
          <input className="rounded border p-2" placeholder="Account name" value={newAccount.name} onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))} required />
          <input className="rounded border p-2" placeholder="Institution" value={newAccount.institution} onChange={(e) => setNewAccount((prev) => ({ ...prev, institution: e.target.value }))} />
          <select className="rounded border p-2" value={newAccount.type} onChange={(e) => setNewAccount((prev) => ({ ...prev, type: e.target.value }))}>
            <option value="bank">Bank</option>
            <option value="credit">Credit</option>
            <option value="savings">Savings</option>
          </select>
          <button className="rounded bg-slate-900 p-2 text-white" type="submit">Add Account</button>
        </form>
        <div className="space-y-2">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between rounded border p-2">
              <div>
                <p className="font-medium">{account.name} {account.is_backup_savings ? '(Backup Savings)' : ''}</p>
                <p className="text-sm text-slate-600">{account.institution ?? '-'} · {account.type}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded border px-2 py-1 text-sm" onClick={() => setBackup(account.id)}>Set Backup Savings</button>
                <button className="rounded border px-2 py-1 text-sm" onClick={() => deleteAccount(account.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
