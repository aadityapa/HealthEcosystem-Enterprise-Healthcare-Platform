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
import { AlertTriangle, ClipboardCheck, FileText, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { complianceApi } from '@/lib/api/compliance';
import type { CompliancePack } from '@/types';

const columns: ColumnDef<CompliancePack>[] = [
  { accessorKey: 'packCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.packCode}</span> },
  { accessorKey: 'name', header: 'Pack' },
  { accessorKey: 'framework', header: 'Framework' },
  { accessorKey: 'compliancePercent', header: 'Compliance', cell: ({ row }) => `${row.original.compliancePercent}%` },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={row.original.status} /> },
];

export default function ComplianceDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['compliance-stats'], queryFn: () => complianceApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['compliance-packs'], queryFn: () => complianceApi.listPacks() });

  if (statsQuery.isError || listQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load compliance dashboard" message="Could not fetch compliance data." onRetry={() => { statsQuery.refetch(); listQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const preview = (listQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Compliance Dashboard" description="Regulatory frameworks, controls, evidence, and risk management" actions={<Button variant="outline" onClick={() => router.push('/compliance/packs')}>View Packs</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Active Packs" value={stats.activePacks} icon={Shield} trend={{ value: stats.packsTrend, label: 'frameworks' }} />
            <StatCard title="Compliant Controls" value={stats.controlsCompliant} icon={ClipboardCheck} trend={{ value: stats.complianceTrend, label: 'improvement' }} />
            <StatCard title="Evidence Pending" value={stats.evidencePending} icon={FileText} trend={{ value: stats.evidenceTrend, label: 'review queue' }} />
            <StatCard title="Open Risks" value={stats.openRisks} icon={AlertTriangle} trend={{ value: stats.risksTrend, label: 'risk reduction' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" />Compliance Packs</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/compliance/packs')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No compliance packs found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
