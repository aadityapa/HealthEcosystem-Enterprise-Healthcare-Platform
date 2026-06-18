'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import { DataTable, StatusBadge, Button } from '@health/design-system';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fetchWithDelay, formatDate, mockPatients } from '@/lib/mock-data';
import type { Patient } from '@/types';

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: 'uhid',
    header: 'UHID',
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium text-primary">{row.original.uhid}</span>
    ),
  },
  {
    id: 'name',
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    header: 'Patient Name',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">
          {row.original.firstName} {row.original.lastName}
        </p>
        <p className="text-xs text-muted-foreground">{row.original.phone}</p>
      </div>
    ),
  },
  {
    accessorKey: 'gender',
    header: 'Gender',
    cell: ({ row }) => <span className="capitalize">{row.original.gender}</span>,
  },
  {
    accessorKey: 'bloodGroup',
    header: 'Blood Group',
    cell: ({ row }) => row.original.bloodGroup ?? '—',
  },
  {
    accessorKey: 'lastVisit',
    header: 'Last Visit',
    cell: ({ row }) => (row.original.lastVisit ? formatDate(row.original.lastVisit) : '—'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function PatientsPage() {
  const router = useRouter();

  const { data: patients = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['patients'],
    queryFn: () => fetchWithDelay(mockPatients),
  });

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="Patients"
          description={`${patients.length} registered patients`}
          actions={
            <Link href="/patients/register">
              <Button>
                <UserPlus className="h-4 w-4" />
                Register Patient
              </Button>
            </Link>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load patients.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={patients}
            searchKey="uhid"
            searchPlaceholder="Search by UHID..."
            isLoading={isLoading}
            emptyMessage="No patients found. Register your first patient to get started."
            onRowClick={(patient) => router.push(`/patients/${patient.id}`)}
          />
        )}
      </div>
    </PageTransition>
  );
}
