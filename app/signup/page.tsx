'use client';

import { FormEvent, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Account created. Check your email if confirmation is enabled.');
    router.push('/login');
  }

  return (
    <section className="mx-auto mt-12 max-w-md rounded-lg bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">Sign up</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input className="w-full rounded border p-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded border p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="w-full rounded bg-slate-900 p-2 text-white" type="submit">Create Account</button>
      </form>
      {message ? <p className="mt-3 text-sm">{message}</p> : null}
    </section>
  );
}
