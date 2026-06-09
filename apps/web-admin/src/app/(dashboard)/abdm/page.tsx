'use client';

import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@health/design-system';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DataTable,
  ErrorState,
  SkeletonStatCards,
  StatCard,
  StatusBadge,
} from '@health/design-system';
import { ArrowLeftRight, FileCode, Fingerprint, Plus, Shield, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { abdmApi } from '@/lib/api/abdm';
import { formatDateTime } from '@/lib/mock-data';
import type { HealthExchangeRecord } from '@/types';

const statusMap: Record<HealthExchangeRecord['status'], 'approved' | 'pending' | 'critical'> = {
  success: 'approved',
  pending: 'pending',
  failed: 'critical',
};

const columns: ColumnDef<HealthExchangeRecord>[] = [
  { accessorKey: 'transactionId', header: 'Txn #', cell: ({ row }) => <span className="font-mono text-xs">{row.original.transactionId}</span> },
  { accessorKey: 'type', header: 'Type', cell: ({ row }) => row.original.type.toUpperCase() },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'abhaAddress', header: 'ABHA', cell: ({ row }) => <span className="font-mono text-xs">{row.original.abhaAddress}</span> },
  { accessorKey: 'hipName', header: 'HIP' },
  { accessorKey: 'hiuName', header: 'HIU' },
  { accessorKey: 'initiatedAt', header: 'Time', cell: ({ row }) => formatDateTime(row.original.initiatedAt) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
];

export default function AbdmDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['abdm-stats'], queryFn: () => abdmApi.getDashboardStats() });
  const exchangeQuery = useQuery({ queryKey: ['abdm-exchange'], queryFn: () => abdmApi.listExchangeRecords() });

  if (statsQuery.isError || exchangeQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load ABDM dashboard" message="Could not fetch ABDM data." onRetry={() => { statsQuery.refetch(); exchangeQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentExchange = (exchangeQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="ABDM Dashboard"
          description="ABHA, consent, FHIR bundles, and health information exchange"
          actions={<Button onClick={() => router.push('/abdm/abha')}><Plus className="h-4 w-4" />Link ABHA</Button>}
        />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="ABHA Linked" value={stats.abhaLinked.toLocaleString()} icon={Fingerprint} trend={{ value: stats.abhaTrend, label: 'vs last month' }} />
            <StatCard title="Consent Requests" value={stats.consentRequests} icon={Shield} trend={{ value: stats.consentTrend, label: 'pending' }} />
            <StatCard title="FHIR Bundles Sent" value={stats.fhirBundlesSent} icon={FileCode} trend={{ value: stats.fhirTrend, label: 'this month' }} />
            <StatCard title="HIE Transactions" value={stats.exchangeTransactions} icon={Share2} trend={{ value: stats.exchangeTrend, label: 'today' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-primary" />Recent HIE Transactions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/abdm/exchange')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentExchange} isLoading={exchangeQuery.isLoading} emptyMessage="No exchange transactions." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
