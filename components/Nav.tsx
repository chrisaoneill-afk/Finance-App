'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload', label: 'Upload' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center gap-2 p-4">
        <Link href="/dashboard" className="mr-4 text-lg font-semibold">
          Cashflow + Pay Myself
        </Link>
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm ${
                active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
