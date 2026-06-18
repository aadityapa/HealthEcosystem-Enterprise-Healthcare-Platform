'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { ehrApi } from '@/lib/api/ehr';
import { formatDateTime } from '@/lib/mock-data';
import type { Appointment } from '@/types';

const statusMap: Record<Appointment['status'], 'pending' | 'processing' | 'approved' | 'inactive' | 'critical'> = {
  scheduled: 'pending',
  'checked-in': 'processing',
  'in-progress': 'processing',
  completed: 'approved',
  cancelled: 'inactive',
  'no-show': 'critical',
};

const columns: ColumnDef<Appointment>[] = [
  { accessorKey: 'appointmentNumber', header: 'Appt #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.appointmentNumber}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'patientUhid', header: 'UHID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.patientUhid}</span> },
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'scheduledAt', header: 'Scheduled', cell: ({ row }) => formatDateTime(row.original.scheduledAt) },
  { accessorKey: 'type', header: 'Type', cell: ({ row }) => row.original.type.replace('-', ' ') },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status.replace('-', ' ')} />
    ),
  },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function AppointmentsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ehr-appointments'],
    queryFn: () => ehrApi.listAppointments(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Appointments" description={`${data.length} appointments scheduled`} actions={<Button><Plus className="h-4 w-4" />Book Appointment</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load appointments.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search appointments..." isLoading={isLoading} emptyMessage="No appointments found." />
        )}
      </div>
    </PageTransition>
  );
}
