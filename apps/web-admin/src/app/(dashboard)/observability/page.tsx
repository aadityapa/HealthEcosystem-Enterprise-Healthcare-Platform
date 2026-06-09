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
import { Activity, AlertTriangle, Shield, Network } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { observabilityApi } from '@/lib/api/observability';
import type { TraceRecord } from '@/types';

const columns: ColumnDef<TraceRecord>[] = [
  { accessorKey: 'traceId', header: 'Trace ID', cell: ({ row }) => <span className="font-mono text-sm">{row.original.traceId ?? '—'}</span> },
  { accessorKey: 'service', header: 'Service' },
  { accessorKey: 'operation', header: 'Operation' },
  { accessorKey: 'durationMs', header: 'Duration (ms)' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function DashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['observability-stats'], queryFn: () => observabilityApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['observability-traces'], queryFn: () => observabilityApi.listTraces() });

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
        <PageHeader title="Observability Dashboard" description="Distributed tracing, SLA monitoring, and service health" />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Traces (24h)" value={stats.totalTraces.toLocaleString()} icon={Activity} trend={{ value: stats.tracesTrend, label: 'vs yesterday' }} />
            <StatCard title="Error Rate" value={`${stats.errorRate}%`} icon={AlertTriangle} trend={{ value: stats.errorTrend, label: 'improvement' }} />
            <StatCard title="SLA Compliance" value={`${stats.slaCompliance}%`} icon={Shield} trend={{ value: stats.slaTrend, label: 'vs last week' }} />
            <StatCard title="Active Services" value={stats.activeServices.toLocaleString()} icon={Network} trend={{ value: stats.servicesTrend, label: 'network growth' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" />Recent Traces</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/observability/traces')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No records found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
