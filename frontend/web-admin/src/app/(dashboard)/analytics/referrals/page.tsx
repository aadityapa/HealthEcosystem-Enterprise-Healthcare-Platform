'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { analyticsApi } from '@/lib/api/analytics';
import { formatCurrency } from '@/lib/mock-data';
import type { ReferralAnalyticsRow } from '@/types';

const columns: ColumnDef<ReferralAnalyticsRow>[] = [
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'specialty', header: 'Specialty' },
  { accessorKey: 'referrals', header: 'Referrals' },
  { accessorKey: 'revenue', header: 'Revenue', cell: ({ row }) => formatCurrency(row.original.revenue) },
  { accessorKey: 'commission', header: 'Commission', cell: ({ row }) => formatCurrency(row.original.commission) },
  { accessorKey: 'conversionRate', header: 'Conversion', cell: ({ row }) => `${row.original.conversionRate > 0 ? '+' : ''}${row.original.conversionRate}%` },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['analytics-referrals'],
    queryFn: () => analyticsApi.listReferralAnalytics(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Referral Analytics" description="Doctor referral performance (${data.length} records)" actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="doctorName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
