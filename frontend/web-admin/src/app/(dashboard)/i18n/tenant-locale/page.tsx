'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable } from '@health/design-system';
import { Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { i18nApi } from '@/lib/api/i18n';
import type { TenantLocaleOverride } from '@/types';

const columns: ColumnDef<TenantLocaleOverride>[] = [
  { accessorKey: 'tenantName', header: 'Tenant' },
  { accessorKey: 'defaultLocale', header: 'Default Locale' },
  { accessorKey: 'fallbackLocale', header: 'Fallback' },
  { accessorKey: 'dateFormat', header: 'Date Format' },
  { accessorKey: 'rtlEnabled', header: 'RTL', cell: ({ row }) => row.original.rtlEnabled ? 'Yes' : 'No' },
];

export default function Page() {
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['i18n-tenant-locale'],
    queryFn: () => i18nApi.listTenantLocales(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Tenant Locale Settings" description={`${data.length} records`} actions={<Button><Plus className="h-4 w-4" />Add New</Button>} />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <DataTable columns={columns} data={data} searchKey="tenantName" searchPlaceholder="Search..." isLoading={isLoading} emptyMessage="No records found." />
        )}
      </div>
    </PageTransition>
  );
}
