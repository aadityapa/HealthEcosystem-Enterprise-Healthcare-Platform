'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Video } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { ehrApi } from '@/lib/api/ehr';
import { formatDateTime } from '@/lib/mock-data';
import type { TelemedicineSession } from '@/types';

const statusMap: Record<TelemedicineSession['status'], 'pending' | 'processing' | 'approved' | 'inactive'> = {
  scheduled: 'pending',
  waiting: 'processing',
  'in-progress': 'processing',
  completed: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<TelemedicineSession>[] = [
  { accessorKey: 'sessionNumber', header: 'Session #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.sessionNumber}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'scheduledAt', header: 'Scheduled', cell: ({ row }) => formatDateTime(row.original.scheduledAt) },
  {
    accessorKey: 'duration',
    header: 'Duration',
    cell: ({ row }) => (row.original.duration > 0 ? `${row.original.duration} min` : '—'),
  },
  { accessorKey: 'platform', header: 'Platform' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status.replace('-', ' ')} />
    ),
  },
];

export default function TelemedicinePage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ehr-telemedicine'],
    queryFn: () => ehrApi.listTelemedicineSessions(),
  });

  const waiting = data.filter((s) => s.status === 'waiting').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Telemedicine"
          description={`${waiting} patients waiting`}
          actions={<Button><Video className="h-4 w-4" />Start Session</Button>}
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load telemedicine sessions.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search sessions..." isLoading={isLoading} emptyMessage="No telemedicine sessions found." />
        )}
      </div>
    </PageTransition>
  );
}
