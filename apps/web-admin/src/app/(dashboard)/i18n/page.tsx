'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorState,
  SkeletonStatCards,
  StatCard,
} from '@health/design-system';
import { Globe, FileText, Target, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { i18nApi } from '@/lib/api/i18n';
import type { CountryLocale } from '@/types';

const columns: ColumnDef<CountryLocale>[] = [
  { accessorKey: 'countryCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.countryCode ?? '—'}</span> },
  { accessorKey: 'countryName', header: 'Country' },
  { accessorKey: 'locale', header: 'Locale' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['i18n-stats'], queryFn: () => i18nApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['i18n-countries'], queryFn: () => i18nApi.listCountries() });

  if (statsQuery.isError || listQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load dashboard" message="Could not fetch data." onRetry={() => { statsQuery.refetch(); listQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const preview = (listQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="i18n Dashboard" description="Locales, translations, and tenant language settings" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Supported Locales" value={stats.supportedLocales.toLocaleString()} icon={Globe} trend={{ value: stats.localesTrend, label: 'vs last quarter' }} />
            <StatCard title="Translation Keys" value={stats.translationKeys.toLocaleString()} icon={FileText} trend={{ value: stats.keysTrend, label: 'vs last month' }} />
            <StatCard title="Coverage" value={`${stats.coveragePercent}%`} icon={Target} trend={{ value: stats.coverageTrend, label: 'improvement' }} />
            <StatCard title="Tenant Overrides" value={stats.tenantOverrides.toLocaleString()} icon={Building2} trend={{ value: stats.overridesTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-primary" />Country Locales</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/i18n/countries')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
