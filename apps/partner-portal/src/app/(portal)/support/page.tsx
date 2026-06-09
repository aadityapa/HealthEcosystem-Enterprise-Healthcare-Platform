'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { partnerPortalApi } from '@/lib/api/partner-portal';
import { formatRelativeDate } from '@/lib/mock-data';

export default function SupportPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ['partner-support'],
    queryFn: () => partnerPortalApi.getSupportTickets(),
  });

  return (
    <div>
      <MobileHeader title="Support" subtitle={`${data.length} tickets`} />
      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />)
        ) : (
          data.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs text-muted-foreground">{ticket.ticketCode}</p>
                    <p className="text-sm font-medium">{ticket.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeDate(ticket.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={ticket.priority === 'urgent' || ticket.priority === 'high' ? 'destructive' : 'outline'}
                      className="capitalize text-[10px]"
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {ticket.status}
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
