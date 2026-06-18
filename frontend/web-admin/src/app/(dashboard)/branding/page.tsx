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
import { Palette, Settings2, Store, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { brandingApi } from '@/lib/api/branding';
import type { BrandingTheme } from '@/types';

const columns: ColumnDef<BrandingTheme>[] = [
  { accessorKey: 'themeCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.themeCode ?? '—'}</span> },
  { accessorKey: 'name', header: 'Theme' },
  { accessorKey: 'primaryColor', header: 'Primary Color' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['branding-stats'], queryFn: () => brandingApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['branding-themes'], queryFn: () => brandingApi.listThemes() });

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
        <PageHeader title="White Label Dashboard" description="Themes, feature flags, and franchise branding" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Themes" value={stats.activeThemes.toLocaleString()} icon={Palette} trend={{ value: stats.themesTrend, label: 'vs last month' }} />
            <StatCard title="Feature Flags" value={stats.featureFlags.toLocaleString()} icon={Settings2} trend={{ value: stats.flagsTrend, label: 'vs last month' }} />
            <StatCard title="Franchise Tenants" value={stats.franchiseTenants.toLocaleString()} icon={Store} trend={{ value: stats.tenantsTrend, label: 'network growth' }} />
            <StatCard title="Custom Domains" value={stats.customDomains.toLocaleString()} icon={Globe} trend={{ value: stats.domainsTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5 text-primary" />Active Themes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/branding/themes')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
