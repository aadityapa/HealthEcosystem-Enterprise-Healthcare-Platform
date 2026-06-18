'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { Button, DataTable, StatusBadge } from '@health/design-system';
import { FileText, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';
import type { ProfileMaster } from '@/types';

const columns: ColumnDef<ProfileMaster>[] = [
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">{row.original.code}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Profile Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: 'packageCount', header: 'Packages' },
  { accessorKey: 'targetAudience', header: 'Target Audience' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function ProfileMasterPage() {
  const { data: profiles = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-profiles'],
    queryFn: () => masterDataApi.listProfiles(),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Profile Master"
          description="Bundled profiles for corporate, retail, and insurance clients"
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add Profile
            </Button>
          }
        />
        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load profiles.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={profiles}
            searchKey="name"
            searchPlaceholder="Search profiles..."
            isLoading={isLoading}
            emptyMessage="No profiles configured."
          />
        )}
      </div>
    </PageTransition>
  );
}
