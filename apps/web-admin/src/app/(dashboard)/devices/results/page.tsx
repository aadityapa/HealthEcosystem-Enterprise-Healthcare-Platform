'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  DataTable,
  ErrorState,
  SkeletonStatCards,
  StatCard,
  StatusBadge,
} from '@health/design-system';
import { CheckCircle2, Clock, FileInput, Percent } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { devicesApi } from '@/lib/api/devices';
import { importStatusMap } from '@/lib/devices/status-maps';
import { formatDateTime } from '@/lib/mock-data';
import type { ResultImportRecord } from '@/types';
import { Button } from '@health/design-system';

const columns: ColumnDef<ResultImportRecord>[] = [
  {
    accessorKey: 'timestamp',
    header: 'Time',
    cell: ({ row }) => formatDateTime(row.original.timestamp),
  },
  {
    accessorKey: 'deviceName',
    header: 'Device',
  },
  {
    accessorKey: 'barcode',
    header: 'Barcode',
    cell: ({ row }) => (
      <span className="font-mono text-sm text-primary">{row.original.barcode}</span>
    ),
  },
  {
    accessorKey: 'testPanel',
    header: 'Test Panel',
  },
  {
    accessorKey: 'resultCount',
    header: 'Results',
    cell: ({ row }) => row.original.resultCount || '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const mapped = importStatusMap[row.original.status];
      return <StatusBadge status={mapped.status} label={mapped.label} />;
    },
  },
  {
    accessorKey: 'errorMessage',
    header: 'Error',
    cell: ({ row }) =>
      row.original.errorMessage ? (
        <span className="max-w-xs truncate text-xs text-destructive">
          {row.original.errorMessage}
        </span>
      ) : (
        '—'
      ),
  },
];

export default function ResultImportPage() {
  const statsQuery = useQuery({
    queryKey: ['result-import-stats'],
    queryFn: devicesApi.getResultImportStats,
  });

  const importsQuery = useQuery({
    queryKey: ['result-imports'],
    queryFn: devicesApi.listResultImports,
    refetchInterval: 20000,
  });

  const statsLoading = statsQuery.isLoading;
  const importsLoading = importsQuery.isLoading;
  const statsError = statsQuery.isError;
  const importsError = importsQuery.isError;
  const stats = statsQuery.data;
  const imports = importsQuery.data ?? [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Result Import"
          description="Dashboard for device result ingestion into LIMS"
        />

        {statsLoading ? (
          <SkeletonStatCards count={4} />
        ) : statsError ? (
          <ErrorState
            title="Failed to load import dashboard"
            onRetry={() => statsQuery.refetch()}
          />
        ) : stats ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Imported Today"
                value={stats.importedToday}
                icon={CheckCircle2}
              />
              <StatCard
                title="Pending Queue"
                value={stats.pendingQueue}
                icon={Clock}
              />
              <StatCard
                title="Success Rate"
                value={`${stats.successRate}%`}
                icon={Percent}
              />
              <StatCard
                title="Failed Today"
                value={stats.failedToday}
                icon={FileInput}
              />
            </div>

            {importsError ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <p className="text-destructive">Failed to load recent imports.</p>
                <Button variant="outline" className="mt-4" onClick={() => importsQuery.refetch()}>
                  Retry
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={imports}
                searchKey="barcode"
                searchPlaceholder="Search by barcode..."
                isLoading={importsLoading}
                emptyMessage="No result imports yet. Device results will appear here once processed."
              />
            )}
          </>
        ) : null}
      </div>
    </PageTransition>
  );
}
