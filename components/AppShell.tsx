'use client';

import type { ReactNode } from 'react';
import { ScopeDataProvider } from '@/components/ScopeDataProvider';

export default function AppShell({ children }: { children: ReactNode }) {
  return <ScopeDataProvider>{children}</ScopeDataProvider>;
}
