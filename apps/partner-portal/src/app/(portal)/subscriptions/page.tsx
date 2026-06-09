'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { partnerPortalApi } from '@/lib/api/partner-portal';
import { formatCurrency, formatDate } from '@/lib/mock-data';

export default function SubscriptionsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['partner-subscriptions'],
    queryFn: () => partnerPortalApi.getSubscriptions(),
  });

  return (
    <div>
      <MobileHeader title="Subscriptions" subtitle={`${data.length} active tenants`} />
      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)
        ) : (
          data.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">{sub.subscriptionCode}</p>
                    <p className="truncate text-sm font-medium">{sub.tenantName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {sub.plan} · Since {formatDate(sub.startDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(sub.mrr)}</p>
                    <p className="text-[10px] text-muted-foreground">/month</p>
                    <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                      {sub.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
