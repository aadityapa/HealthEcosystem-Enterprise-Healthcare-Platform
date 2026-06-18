'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { crmApi } from '@/lib/api/crm';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { SalesLead } from '@/types';

const statusMap: Record<SalesLead['status'], 'inactive' | 'pending' | 'processing' | 'approved' | 'critical'> = {
  new: 'inactive',
  contacted: 'pending',
  qualified: 'processing',
  proposal: 'processing',
  won: 'approved',
  lost: 'critical',
};

const columns: ColumnDef<SalesLead>[] = [
  { accessorKey: 'leadNumber', header: 'Lead #', cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.leadNumber}</span> },
  { accessorKey: 'companyName', header: 'Company' },
  { accessorKey: 'contactPerson', header: 'Contact' },
  { accessorKey: 'phone', header: 'Phone' },
  { accessorKey: 'estimatedValue', header: 'Est. Value', cell: ({ row }) => formatCurrency(row.original.estimatedValue) },
  { accessorKey: 'source', header: 'Source', cell: ({ row }) => row.original.source.charAt(0).toUpperCase() + row.original.source.slice(1) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
  { accessorKey: 'assignedTo', header: 'Assigned To' },
  { accessorKey: 'createdAt', header: 'Created', cell: ({ row }) => formatDate(row.original.createdAt) },
];

export default function LeadsPage() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => crmApi.listLeads(),
  });

  const pipeline = data.filter((l) => !['won', 'lost'].includes(l.status));
  const pipelineValue = pipeline.reduce((sum, l) => sum + l.estimatedValue, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Sales Leads" description={`${formatCurrency(pipelineValue)} in pipeline · ${pipeline.length} active leads`} actions={<Button><Plus className="h-4 w-4" />New Lead</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load leads.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="companyName" searchPlaceholder="Search leads..." isLoading={isLoading} emptyMessage="No leads found." />
        )}
      </div>
    </PageTransition>
  );
}
