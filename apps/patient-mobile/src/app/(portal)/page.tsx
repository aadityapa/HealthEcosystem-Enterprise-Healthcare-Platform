'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  IndianRupee,
  TestTube2,
  TrendingUp,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  SkeletonStatCards,
  StatCard,
} from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { patientPortalApi } from '@/lib/api/patient-portal';
import { formatCurrency, formatRelativeDate } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth.store';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => patientPortalApi.getDashboardSummary(),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => patientPortalApi.getAppointments(),
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline-preview'],
    queryFn: () => patientPortalApi.getTimeline(),
  });

  const upcoming = appointments?.filter((a) => a.status === 'scheduled').slice(0, 2) ?? [];
  const recentEvents = timeline?.slice(0, 3) ?? [];

  return (
    <div>
      <MobileHeader showGreeting />

      <div className="space-y-6 px-4 py-4">
        {user && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">UHID</p>
                <p className="font-mono text-sm font-medium">{user.uhid}</p>
              </div>
              {user.bloodGroup && (
                <Badge variant="secondary">{user.bloodGroup}</Badge>
              )}
            </CardContent>
          </Card>
        )}

        {summaryLoading ? (
          <SkeletonStatCards count={2} />
        ) : summary ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Health Events"
              value={summary.recentEvents}
              icon={TrendingUp}
              className="p-4"
            />
            <StatCard
              title="Outstanding"
              value={formatCurrency(summary.outstandingAmount)}
              icon={IndianRupee}
              className="p-4"
            />
          </div>
        ) : null}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/reports', label: 'My Reports', icon: FileText, color: 'text-blue-600' },
              { href: '/booking', label: 'Book Test', icon: TestTube2, color: 'text-emerald-600' },
              { href: '/home-collection', label: 'Home Collection', icon: Calendar, color: 'text-violet-600' },
              { href: '/payments', label: 'Payments', icon: IndianRupee, color: 'text-amber-600' },
            ].map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex flex-col items-center gap-2 p-4">
                    <Icon className={`h-6 w-6 ${color}`} />
                    <span className="text-xs font-medium">{label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Upcoming Appointments</h2>
            <Link href="/booking" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>

          {appointmentsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{apt.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatRelativeDate(apt.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {apt.time}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{apt.location}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {apt.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                No upcoming appointments
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold">Health Timeline</h2>
            <Link
              href="/timeline"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              See all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {timelineLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{event.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeDate(event.date)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
