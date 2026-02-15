import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Finance App',
  description: 'Cashflow and pay myself planner',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}
