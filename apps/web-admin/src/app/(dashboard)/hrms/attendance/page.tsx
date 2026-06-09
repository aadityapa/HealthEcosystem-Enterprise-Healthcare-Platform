'use client';

import { useQuery } from '@tanstack/react-query';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { hrmsApi } from '@/lib/api/hrms';
import { formatDate } from '@/lib/mock-data';
import type { HrmsAttendanceRecord } from '@/types';

const columns: ColumnDef<HrmsAttendanceRecord>[] = [
  { accessorKey: 'employeeCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.employeeCode ?? '—'}</span> },
  { accessorKey: 'employeeName', header: 'Employee' },
  { accessorKey: 'date', header: 'Date', cell: ({ row }) => formatDate(row.original.date) },
  { accessorKey: 'checkIn', header: 'Check In' },
  { accessorKey: 'checkOut', header: 'Check Out', cell: ({ row }) => row.original.checkOut ?? '—' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={String(row.original.status)} /> },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['hrms-attendance'],
    queryFn: () => hrmsApi.listAttendance(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="HR Attendance" description={`Employee attendance records ${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
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
