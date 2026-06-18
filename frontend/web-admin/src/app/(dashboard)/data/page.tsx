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
import { GitBranch, Database, BarChart3, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { dataPlatformApi } from '@/lib/api/data-platform';
import type { DataPipeline } from '@/types';

const columns: ColumnDef<DataPipeline>[] = [
  { accessorKey: 'pipelineCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.pipelineCode ?? '—'}</span> },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'source', header: 'Source' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['data-platform-stats'], queryFn: () => dataPlatformApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['data-pipelines'], queryFn: () => dataPlatformApi.listPipelines() });

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
        <PageHeader title="Data Platform Dashboard" description="Pipelines, data lake, warehouse, and exports" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Pipelines" value={stats.activePipelines.toLocaleString()} icon={GitBranch} trend={{ value: stats.pipelinesTrend, label: 'vs last month' }} />
            <StatCard title="Data Lake Size" value={`${stats.lakeSizeTb} TB`} icon={Database} trend={{ value: stats.lakeTrend, label: 'growth' }} />
            <StatCard title="Warehouse Queries" value={stats.warehouseQueriesToday.toLocaleString()} icon={BarChart3} trend={{ value: stats.queriesTrend, label: 'vs yesterday' }} />
            <StatCard title="Scheduled Exports" value={stats.exportsScheduled.toLocaleString()} icon={Upload} trend={{ value: stats.exportsTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" />Recent Pipelines</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/data/pipelines')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
