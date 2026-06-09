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
import { FileText, Database, Shield, Scan } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { dmsApi } from '@/lib/api/dms';
import type { DmsDocument } from '@/types';

const columns: ColumnDef<DmsDocument>[] = [
  { accessorKey: 'documentCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.documentCode ?? '—'}</span> },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['dms-stats'], queryFn: () => dmsApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['dms-documents'], queryFn: () => dmsApi.listDocuments() });

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
        <PageHeader title="DMS Dashboard" description="Document management, search, and retention policies" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Documents" value={stats.totalDocuments.toLocaleString()} icon={FileText} trend={{ value: stats.documentsTrend, label: 'vs last month' }} />
            <StatCard title="Storage Used" value={`${stats.storageUsedGb} GB`} icon={Database} trend={{ value: stats.storageTrend, label: 'growth' }} />
            <StatCard title="Retention Policies" value={stats.retentionPolicies.toLocaleString()} icon={Shield} trend={{ value: stats.policiesTrend, label: 'vs last month' }} />
            <StatCard title="Searches Today" value={stats.searchesToday.toLocaleString()} icon={Scan} trend={{ value: stats.searchesTrend, label: 'vs yesterday' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" />Recent Documents</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/dms/documents')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
