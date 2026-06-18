'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  ClipboardList,
  IndianRupee,
  TestTube2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  SkeletonStatCards,
  StatCard,
} from '@health/design-system';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { fetchWithDelay, formatCurrency, mockDashboardStats } from '@/lib/mock-data';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => fetchWithDelay(mockDashboardStats),
  });

  return (
    <PageTransition>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Overview of today's operations across all branches"
        />

        {isLoading ? (
          <SkeletonStatCards count={4} />
        ) : stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Patients"
              value={stats.totalPatients.toLocaleString('en-IN')}
              icon={Users}
              trend={{ value: stats.patientsTrend, label: 'vs last month' }}
            />
            <StatCard
              title="Today's Orders"
              value={stats.todayOrders}
              icon={ClipboardList}
              trend={{ value: stats.ordersTrend, label: 'vs yesterday' }}
            />
            <StatCard
              title="Pending Samples"
              value={stats.pendingSamples}
              icon={TestTube2}
              trend={{ value: stats.samplesTrend, label: 'vs yesterday' }}
            />
            <StatCard
              title="Revenue Today"
              value={formatCurrency(stats.revenueToday)}
              icon={IndianRupee}
              trend={{ value: stats.revenueTrend, label: 'vs yesterday' }}
            />
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { href: '/patients/register', label: 'Register Patient', desc: 'Add new patient record' },
                { href: '/lims/orders/new', label: 'New Lab Order', desc: 'Create diagnostic order' },
                { href: '/lims/samples', label: 'Track Samples', desc: 'View sample pipeline' },
                { href: '/billing', label: 'Billing', desc: 'Invoices & payments' },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center justify-between rounded-lg border p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div>
                    <p className="font-medium">{action.label}</p>
                    <p className="text-sm text-muted-foreground">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { time: '10:32 AM', event: 'Sample SMP-20260608-003 verified', type: 'lims' },
                  { time: '10:15 AM', event: 'New patient registered — Ananya Patel', type: 'patient' },
                  { time: '09:48 AM', event: 'Invoice INV-2026-08423 created', type: 'billing' },
                  { time: '09:30 AM', event: 'Critical result flagged — WBC elevated', type: 'alert' },
                  { time: '08:55 AM', event: 'Order ORD-2026-08421 collected', type: 'lims' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0">
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.type === 'alert'
                          ? 'bg-destructive'
                          : item.type === 'lims'
                            ? 'bg-primary'
                            : item.type === 'billing'
                              ? 'bg-warning'
                              : 'bg-success'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">{item.event}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
