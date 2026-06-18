'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { qcApi } from '@/lib/api/qc';
import { formatDate, formatDateTime } from '@/lib/mock-data';
import type { CalibrationRecord } from '@/types';

const statusMap: Record<CalibrationRecord['status'], 'approved' | 'critical' | 'pending'> = {
  passed: 'approved',
  failed: 'critical',
  scheduled: 'pending',
};

const columns: ColumnDef<CalibrationRecord>[] = [
  { accessorKey: 'deviceCode', header: 'Device', cell: ({ row }) => (
    <div>
      <p className="font-mono text-sm font-medium">{row.original.deviceCode}</p>
      <p className="text-xs text-muted-foreground">{row.original.deviceName}</p>
    </div>
  )},
  { accessorKey: 'calibrationType', header: 'Type' },
  { accessorKey: 'performedAt', header: 'Performed', cell: ({ row }) => formatDateTime(row.original.performedAt) },
  { accessorKey: 'performedBy', header: 'By' },
  { accessorKey: 'nextDue', header: 'Next Due', cell: ({ row }) => formatDate(row.original.nextDue) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
  {
    accessorKey: 'notes',
    header: 'Notes',
    cell: ({ row }) => row.original.notes ?? '—',
  },
];

export default function CalibrationPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['qc-calibration'],
    queryFn: () => qcApi.listCalibrations(),
  });

  const due = data.filter((c) => c.status === 'scheduled').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Calibration"
          description={`${due} calibrations scheduled`}
          actions={<Button><Plus className="h-4 w-4" />Schedule Calibration</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load calibration records.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="deviceName" searchPlaceholder="Search devices..." isLoading={isLoading} emptyMessage="No calibration records." />
        )}
      </div>
    </PageTransition>
  );
}
