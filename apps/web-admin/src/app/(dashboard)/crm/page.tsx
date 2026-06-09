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
import { Calendar, Plus, Stethoscope, Target, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { crmApi } from '@/lib/api/crm';
import { formatCurrency, formatDate } from '@/lib/mock-data';
import type { Referral } from '@/types';

const statusMap: Record<Referral['status'], 'pending' | 'approved' | 'inactive'> = {
  pending: 'pending',
  completed: 'approved',
  cancelled: 'inactive',
};

const columns: ColumnDef<Referral>[] = [
  { accessorKey: 'referralNumber', header: 'Ref #', cell: ({ row }) => <span className="font-mono text-sm">{row.original.referralNumber}</span> },
  { accessorKey: 'doctorName', header: 'Doctor' },
  { accessorKey: 'patientName', header: 'Patient' },
  { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
  { accessorKey: 'commission', header: 'Commission', cell: ({ row }) => formatCurrency(row.original.commission) },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge status={statusMap[row.original.status]} label={row.original.status} />
    ),
  },
  { accessorKey: 'referredAt', header: 'Date', cell: ({ row }) => formatDate(row.original.referredAt) },
];

export default function CrmDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['crm-stats'], queryFn: () => crmApi.getDashboardStats() });
  const referralsQuery = useQuery({ queryKey: ['crm-referrals'], queryFn: () => crmApi.listReferrals() });

  if (statsQuery.isError || referralsQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load CRM dashboard" message="Could not fetch CRM data." onRetry={() => { statsQuery.refetch(); referralsQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentReferrals = (referralsQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="CRM Dashboard"
          description="Doctor network, referrals, and B2B sales"
          actions={<Button onClick={() => router.push('/crm/leads')}><Plus className="h-4 w-4" />New Lead</Button>}
        />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Doctors" value={stats.activeDoctors} icon={Stethoscope} trend={{ value: stats.doctorsTrend, label: 'vs last quarter' }} />
            <StatCard title="Referrals (Month)" value={stats.referralsThisMonth.toLocaleString()} icon={TrendingUp} trend={{ value: stats.referralsTrend, label: 'vs last month' }} />
            <StatCard title="Active Camps" value={stats.activeCamps} icon={Calendar} trend={{ value: stats.campsTrend, label: 'ongoing' }} />
            <StatCard title="Open Leads" value={stats.openLeads} icon={Target} trend={{ value: stats.leadsTrend, label: 'pipeline' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Recent Referrals</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/crm/referrals')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentReferrals} isLoading={referralsQuery.isLoading} emptyMessage="No referrals yet." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
