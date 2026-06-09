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
} from '@health/design-system';
import { ClipboardList, CreditCard, FileText, Handshake, IndianRupee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { commercialApi } from '@/lib/api/commercial';
import { formatCurrency } from '@/lib/mock-data';
import type { CommercialSubscription } from '@/types';

const columns: ColumnDef<CommercialSubscription>[] = [
  { accessorKey: 'subscriptionCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.subscriptionCode}</span> },
  { accessorKey: 'tenantName', header: 'Tenant' },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'mrr', header: 'MRR', cell: ({ row }) => formatCurrency(row.original.mrr) },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={row.original.status} /> },
];

export default function CommercialDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['commercial-stats'], queryFn: () => commercialApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['commercial-subscriptions'], queryFn: () => commercialApi.listSubscriptions() });

  if (statsQuery.isError || listQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load commercial dashboard" message="Could not fetch commercial data." onRetry={() => { statsQuery.refetch(); listQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const preview = (listQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Commercial Dashboard" description="Plans, subscriptions, quotations, and partner revenue" actions={<Button variant="outline" onClick={() => router.push('/commercial/subscriptions')}>View Subscriptions</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Plans" value={stats.activePlans} icon={ClipboardList} trend={{ value: stats.plansTrend, label: 'catalog' }} />
            <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={CreditCard} trend={{ value: stats.subscriptionsTrend, label: 'growth' }} />
            <StatCard title="Pending Quotations" value={stats.pendingQuotations} icon={FileText} trend={{ value: stats.quotationsTrend, label: 'sales pipeline' }} />
            <StatCard title="Partner Revenue" value={formatCurrency(stats.partnerRevenue)} icon={IndianRupee} trend={{ value: stats.revenueTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" />Active Subscriptions</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/commercial/subscriptions')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No subscriptions found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
