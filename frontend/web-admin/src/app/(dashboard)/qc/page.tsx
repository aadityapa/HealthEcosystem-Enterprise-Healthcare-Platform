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
  StatusBadge,
} from '@health/design-system';
import { AlertTriangle, ClipboardCheck, FlaskConical, LineChart, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { qcApi } from '@/lib/api/qc';
import { formatDateTime } from '@/lib/mock-data';
import type { QcRun } from '@/types';

const runStatusMap: Record<QcRun['status'], 'approved' | 'pending' | 'critical'> = {
  'in-range': 'approved',
  warning: 'pending',
  reject: 'critical',
};

const runColumns: ColumnDef<QcRun>[] = [
  { accessorKey: 'runNumber', header: 'Run #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.runNumber}</span> },
  { accessorKey: 'materialName', header: 'Material' },
  { accessorKey: 'analyte', header: 'Analyte' },
  {
    accessorKey: 'value',
    header: 'Value',
    cell: ({ row }) => `${row.original.value} ${row.original.unit}`,
  },
  {
    accessorKey: 'zScore',
    header: 'Z-Score',
    cell: ({ row }) => row.original.zScore.toFixed(2),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={runStatusMap[row.original.status]} label={row.original.status} />
    ),
  },
  { accessorKey: 'runAt', header: 'Run At', cell: ({ row }) => formatDateTime(row.original.runAt) },
];

export default function QcDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['qc-stats'], queryFn: () => qcApi.getDashboardStats() });
  const runsQuery = useQuery({ queryKey: ['qc-runs'], queryFn: () => qcApi.listRuns() });

  if (statsQuery.isError || runsQuery.isError) {
    return (
      <PageTransition>
        <ErrorState
          title="Failed to load QC dashboard"
          message="Could not fetch QC data. Please try again."
          onRetry={() => { statsQuery.refetch(); runsQuery.refetch(); }}
        />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentRuns = (runsQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Quality Control Dashboard"
          description="QC runs, materials, and compliance overview"
          actions={
            <Button onClick={() => router.push('/qc/runs')}>
              <Plus className="h-4 w-4" />
              Log QC Run
            </Button>
          }
        />

        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Materials" value={stats.activeMaterials} icon={FlaskConical} trend={{ value: stats.materialsTrend, label: 'vs last month' }} />
            <StatCard title="Runs Today" value={stats.runsToday} icon={ClipboardCheck} trend={{ value: stats.runsTrend, label: 'vs yesterday' }} />
            <StatCard title="Out of Range" value={stats.outOfRange} icon={AlertTriangle} trend={{ value: stats.oorTrend, label: 'today' }} />
            <StatCard title="Open CAPA" value={stats.openCapa} icon={LineChart} trend={{ value: stats.capaTrend, label: 'items' }} />
          </div>
        ) : null}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Recent QC Runs
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/qc/runs')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={runColumns} data={recentRuns} isLoading={runsQuery.isLoading} emptyMessage="No QC runs today." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
