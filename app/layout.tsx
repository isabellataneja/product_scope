import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'Product Scope Comparison',
  description: 'Product scope one-pager, master sheet, and comparison tools',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <AppShell>
          <NavBar />
          <main>{children}</main>
        </AppShell>
      </body>
    </html>
  );
}
