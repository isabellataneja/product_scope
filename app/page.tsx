'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ScopeRow } from '@/types';
import rawData from '@/data/scopeData.json';
import ScopeOnePager from '@/components/ScopeOnePager';

const rows = rawData as ScopeRow[];

function HomeInner() {
  const searchParams = useSearchParams();
  const pl = searchParams.get('pl');
  return <ScopeOnePager rows={rows} initialProductLine={pl} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[calc(100vh-48px)] text-gray-400">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
      </div>
    }>
      <HomeInner />
    </Suspense>
  );
}
