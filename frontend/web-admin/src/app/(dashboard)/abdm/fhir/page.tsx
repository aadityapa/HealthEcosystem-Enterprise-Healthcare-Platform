'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Send } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { abdmApi } from '@/lib/api/abdm';
import { formatDateTime } from '@/lib/mock-data';
import type { FhirBundle } from '@/types';

const statusMap: Record<FhirBundle['status'], 'approved' | 'processing' | 'critical' | 'pending'> = {
  sent: 'processing',
  acknowledged: 'approved',
  failed: 'critical',
  pending: 'pending',
};

const columns: ColumnDef<FhirBundle>[] = [
  { accessorKey: 'bundleId', header: 'Bundle ID', cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.bundleId}</span> },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'bundleType', header: 'Type', cell: ({ row }) => row.original.bundleType.charAt(0).toUpperCase() + row.original.bundleType.slice(1) },
  { accessorKey: 'resourceCount', header: 'Resources' },
  { accessorKey: 'destination', header: 'Destination' },
  { accessorKey: 'sentAt', header: 'Sent', cell: ({ row }) => formatDateTime(row.original.sentAt) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function FhirPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['abdm-fhir'],
    queryFn: () => abdmApi.listFhirBundles(),
  });

  const failed = data.filter((b) => b.status === 'failed').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="FHIR Bundles" description={`${data.length} bundles · ${failed} failed`} actions={<Button><Send className="h-4 w-4" />Send Bundle</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load FHIR bundles.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="bundleId" searchPlaceholder="Search bundles..." isLoading={isLoading} emptyMessage="No FHIR bundles found." />
        )}
      </div>
    </PageTransition>
  );
}
