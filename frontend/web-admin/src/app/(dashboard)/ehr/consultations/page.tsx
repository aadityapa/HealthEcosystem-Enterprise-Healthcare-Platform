'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { ehrApi } from '@/lib/api/ehr';
import { formatDateTime } from '@/lib/mock-data';
import type { Consultation } from '@/types';

const statusMap: Record<Consultation['status'], 'processing' | 'approved' | 'pending'> = {
  'in-progress': 'processing',
  completed: 'approved',
  'pending-review': 'pending',
};

const columns: ColumnDef<Consultation>[] = [
  { accessorKey: 'consultationNumber', header: 'Consult #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.consultationNumber}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'chiefComplaint', header: 'Chief Complaint' },
  { accessorKey: 'diagnosis', header: 'Diagnosis', cell: ({ row }) => row.original.diagnosis ?? '—' },
  { accessorKey: 'startedAt', header: 'Started', cell: ({ row }) => formatDateTime(row.original.startedAt) },
  { accessorKey: 'duration', header: 'Duration', cell: ({ row }) => `${row.original.duration} min` },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status.replace('-', ' ')} />
    ),
  },
  { accessorKey: 'branch', header: 'Branch' },
];

export default function ConsultationsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ehr-consultations'],
    queryFn: () => ehrApi.listConsultations(),
  });

  const inProgress = data.filter((c) => c.status === 'in-progress').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Consultations" description={`${inProgress} consultations in progress`} actions={<Button><Plus className="h-4 w-4" />Start Consultation</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load consultations.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search consultations..." isLoading={isLoading} emptyMessage="No consultations found." />
        )}
      </div>
    </PageTransition>
  );
}
