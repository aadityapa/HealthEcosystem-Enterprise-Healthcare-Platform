'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { partnerPortalApi } from '@/lib/api/partner-portal';
import { formatCurrency, formatDate } from '@/lib/mock-data';

export default function ContractsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['partner-contracts'],
    queryFn: () => partnerPortalApi.getContracts(),
  });

  return (
    <div>
      <MobileHeader title="Contracts" subtitle={`${data.length} agreements`} />
      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)
        ) : (
          data.map((contract) => (
            <Card key={contract.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">{contract.contractCode}</p>
                    <p className="truncate text-sm font-medium">{contract.tenantName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(contract.value)}</p>
                    <Badge variant="outline" className="mt-1 capitalize text-[10px]">
                      {contract.status}
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
