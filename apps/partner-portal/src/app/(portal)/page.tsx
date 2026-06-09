'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  ArrowRight,
  CreditCard,
  FileSignature,
  FileText,
  Handshake,
  IndianRupee,
} from 'lucide-react';
import {
  Badge,
  Card,
  CardContent,
  SkeletonStatCards,
  StatCard,
} from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { partnerPortalApi } from '@/lib/api/partner-portal';
import { formatCurrency } from '@/lib/mock-data';
import { useAuthStore } from '@/stores/auth.store';

export default function PartnerDashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['partner-dashboard'],
    queryFn: () => partnerPortalApi.getDashboardSummary(),
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['partner-subscriptions-preview'],
    queryFn: () => partnerPortalApi.getSubscriptions(),
  });

  const recentSubs = subscriptions?.slice(0, 3) ?? [];

  return (
    <div>
      <MobileHeader showGreeting />

      <div className="space-y-6 px-4 py-4">
        {user && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">Partner Code</p>
                <p className="font-mono text-sm font-medium">{user.partnerCode}</p>
              </div>
              <Badge variant="secondary" className="capitalize">
                {user.type.replace('-', ' ')}
              </Badge>
            </CardContent>
          </Card>
        )}

        {summaryLoading ? (
          <SkeletonStatCards count={2} />
        ) : summary ? (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Subscriptions"
              value={summary.activeSubscriptions}
              icon={CreditCard}
              className="p-4"
            />
            <StatCard
              title="Monthly Revenue"
              value={formatCurrency(summary.monthlyRevenue)}
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
              { href: '/subscriptions', label: 'Subscriptions', icon: CreditCard, color: 'text-blue-600' },
              { href: '/quotations', label: 'Quotations', icon: FileText, color: 'text-emerald-600' },
              { href: '/contracts', label: 'Contracts', icon: FileSignature, color: 'text-violet-600' },
              { href: '/revenue', label: 'Revenue', icon: IndianRupee, color: 'text-amber-600' },
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
            <h2 className="font-display text-sm font-semibold">Active Subscriptions</h2>
            <Link href="/subscriptions" className="flex items-center gap-1 text-xs text-primary hover:underline">
              See all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {subsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="divide-y divide-border p-0">
                {recentSubs.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{sub.tenantName}</p>
                      <p className="text-xs text-muted-foreground">{sub.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(sub.mrr)}</p>
                      <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                        {sub.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {summary && (
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <Handshake className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Revenue Share: {summary.revenueShare}%</p>
                <p className="text-xs text-muted-foreground">
                  {summary.pendingQuotations} pending quotations · {summary.activeContracts} active contracts
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
