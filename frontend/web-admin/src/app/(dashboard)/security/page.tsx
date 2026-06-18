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
import { AlertTriangle, Bug, FileKey, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { GenericStatusBadge } from '@/lib/generic-status-badge';
import { securityApi } from '@/lib/api/security';
import type { SecurityIncident } from '@/types';

const columns: ColumnDef<SecurityIncident>[] = [
  { accessorKey: 'incidentCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.incidentCode}</span> },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'severity', header: 'Severity', cell: ({ row }) => <GenericStatusBadge value={row.original.severity} /> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <GenericStatusBadge value={row.original.status} /> },
];

export default function SecurityDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['security-stats'], queryFn: () => securityApi.getDashboardStats() });
  const listQuery = useQuery({ queryKey: ['security-incidents'], queryFn: () => securityApi.listIncidents() });

  if (statsQuery.isError || listQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load security dashboard" message="Could not fetch security data." onRetry={() => { statsQuery.refetch(); listQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const preview = (listQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="Security Dashboard" description="SOC monitoring, threat detection, and vulnerability management" actions={<Button variant="outline" onClick={() => router.push('/security/incidents')}>View Incidents</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Open Incidents" value={stats.openIncidents} icon={AlertTriangle} trend={{ value: stats.incidentsTrend, label: 'vs last week' }} />
            <StatCard title="Active Threats" value={stats.activeThreats} icon={Shield} trend={{ value: stats.threatsTrend, label: 'detection rate' }} />
            <StatCard title="Open Vulnerabilities" value={stats.openVulnerabilities} icon={Bug} trend={{ value: stats.vulnerabilitiesTrend, label: 'remediation' }} />
            <StatCard title="Expiring Certificates" value={stats.expiringCertificates} icon={FileKey} trend={{ value: stats.certificatesTrend, label: 'needs renewal' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" />Recent Incidents</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/security/incidents')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={preview} isLoading={listQuery.isLoading} emptyMessage="No incidents found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
