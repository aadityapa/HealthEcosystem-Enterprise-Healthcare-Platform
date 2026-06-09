'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { partnerPortalApi } from '@/lib/api/partner-portal';
import { formatCurrency } from '@/lib/mock-data';

export default function RevenuePage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['partner-revenue'],
    queryFn: () => partnerPortalApi.getRevenue(),
  });

  const latest = data[data.length - 1];

  return (
    <div>
      <MobileHeader title="Revenue" subtitle="Partner earnings & share" />
      <div className="space-y-4 px-4 py-4">
        {latest && !isLoading && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Current Period Earnings</p>
              <p className="font-display text-2xl font-bold">{formatCurrency(latest.partnerEarnings)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {latest.revenueShare}% of {formatCurrency(latest.grossRevenue)} gross · {latest.subscriptions} subs
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)
        ) : (
          data.map((row) => (
            <Card key={row.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{row.period}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.subscriptions} subscriptions · {row.revenueShare}% share
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">
                  {formatCurrency(row.partnerEarnings)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
