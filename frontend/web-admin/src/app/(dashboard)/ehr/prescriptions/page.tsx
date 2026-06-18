'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { ehrApi } from '@/lib/api/ehr';
import { formatDate, formatDateTime } from '@/lib/mock-data';
import type { Prescription } from '@/types';

const statusMap: Record<Prescription['status'], 'approved' | 'processing' | 'inactive' | 'critical'> = {
  active: 'approved',
  dispensed: 'processing',
  expired: 'inactive',
  cancelled: 'critical',
};

const columns: ColumnDef<Prescription>[] = [
  { accessorKey: 'prescriptionNumber', header: 'Rx #', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.prescriptionNumber}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'doctorName', header: 'Doctor' },
  {
    accessorKey: 'medications',
    header: 'Medications',
    cell: ({ row }) => (
      <span className="max-w-xs truncate text-sm">{row.original.medications.join('; ')}</span>
    ),
  },
  { accessorKey: 'issuedAt', header: 'Issued', cell: ({ row }) => formatDateTime(row.original.issuedAt) },
  { accessorKey: 'validUntil', header: 'Valid Until', cell: ({ row }) => formatDate(row.original.validUntil) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function PrescriptionsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['ehr-prescriptions'],
    queryFn: () => ehrApi.listPrescriptions(),
  });

  const active = data.filter((p) => p.status === 'active').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Prescriptions" description={`${active} active prescriptions`} actions={<Button><Plus className="h-4 w-4" />New Prescription</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load prescriptions.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="patientName" searchPlaceholder="Search prescriptions..." isLoading={isLoading} emptyMessage="No prescriptions found." />
        )}
      </div>
    </PageTransition>
  );
}
