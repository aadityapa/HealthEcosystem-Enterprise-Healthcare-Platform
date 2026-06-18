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
import { Briefcase, IndianRupee, UserCheck, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { hrmsApi } from '@/lib/api/hrms';
import { formatCurrency } from '@/lib/mock-data';
import type { Employee } from '@/types';

const columns: ColumnDef<Employee>[] = [
  { accessorKey: 'employeeCode', header: 'Code', cell: ({ row }) => <span className="font-mono text-sm">{row.original.employeeCode}</span> },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'department', header: 'Department' },
  { accessorKey: 'designation', header: 'Designation' },
  { accessorKey: 'branch', header: 'Branch' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status === 'active' ? 'approved' : row.original.status === 'on-leave' ? 'pending' : 'inactive'}
        label={row.original.status}
      />
    ),
  },
];

export default function HrmsDashboardPage() {
  const router = useRouter();
  const statsQuery = useQuery({ queryKey: ['hrms-stats'], queryFn: () => hrmsApi.getDashboardStats() });
  const employeesQuery = useQuery({ queryKey: ['hrms-employees'], queryFn: () => hrmsApi.listEmployees() });

  if (statsQuery.isError || employeesQuery.isError) {
    return (
      <PageTransition>
        <ErrorState title="Failed to load HRMS dashboard" message="Could not fetch HRMS data." onRetry={() => { statsQuery.refetch(); employeesQuery.refetch(); }} />
      </PageTransition>
    );
  }

  const stats = statsQuery.data;
  const recentEmployees = (employeesQuery.data ?? []).slice(0, 5);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader title="HRMS Dashboard" description="Employee management, payroll, and training" actions={<Button onClick={() => router.push('/hrms/employees')}><Users className="h-4 w-4" />Employees</Button>} />
        {statsQuery.isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Employees" value={stats.totalEmployees} icon={Users} trend={{ value: stats.employeesTrend, label: 'vs last quarter' }} />
            <StatCard title="Present Today" value={stats.presentToday} icon={UserCheck} trend={{ value: stats.attendanceTrend, label: 'attendance rate' }} />
            <StatCard title="Open Positions" value={stats.openPositions} icon={Briefcase} trend={{ value: stats.positionsTrend, label: 'vs last month' }} />
            <StatCard title="Payroll Due" value={formatCurrency(stats.payrollDue)} icon={IndianRupee} trend={{ value: stats.payrollTrend, label: 'vs last month' }} />
          </div>
        ) : null}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Recent Employees</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/hrms/employees')}>View All</Button>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns} data={recentEmployees} isLoading={employeesQuery.isLoading} emptyMessage="No employees found." />
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
