'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { hrmsApi } from '@/lib/api/hrms';
import { formatCurrency } from '@/lib/mock-data';
import type { PayrollRecord } from '@/types';

const columns: ColumnDef<PayrollRecord>[] = [
  { accessorKey: 'employeeCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.employeeCode ?? '—'}</span> },
  { accessorKey: 'employeeName', header: 'Employee' },
  { accessorKey: 'period', header: 'Period' },
  { accessorKey: 'grossSalary', header: 'Gross', cell: ({ row }) => formatCurrency(row.original.grossSalary) },
  { accessorKey: 'deductions', header: 'Deductions', cell: ({ row }) => formatCurrency(row.original.deductions) },
  { accessorKey: 'netSalary', header: 'Net', cell: ({ row }) => formatCurrency(row.original.netSalary) },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['hrms-payroll'],
    queryFn: () => hrmsApi.listPayroll(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Payroll" description={`Salary processing and payments ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="employeeName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
