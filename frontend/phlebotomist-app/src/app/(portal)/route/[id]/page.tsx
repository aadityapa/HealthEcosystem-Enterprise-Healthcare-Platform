'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';
import { Badge, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { fieldApi } from '@/lib/api/field';
import { formatTime } from '@/lib/mock-data';

interface RoutePageProps {
  params: Promise<{ id: string }>;
}

export default function RouteDetailPage({ params }: RoutePageProps) {
  const { id } = use(params);

  const { data: route, isLoading } = useQuery({
    queryKey: ['route', id],
    queryFn: () => fieldApi.getRoute(id),
  });

  return (
    <div>
      <MobileHeader
        title={route?.routeNumber ?? 'Route'}
        subtitle={`${route?.completedStops ?? 0}/${route?.totalStops ?? 0} completed`}
      />

      <div className="space-y-3 px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          route?.stops.map((stop) => (
            <Link key={stop.id} href={`/stop/${stop.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {stop.stopOrder}
                        </span>
                        <p className="truncate font-medium">{stop.patientName}</p>
                      </div>
                      <p className="mt-2 flex items-start gap-1 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        {stop.address.line1}
                      </p>
                      {stop.scheduledAt && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTime(stop.scheduledAt)}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="shrink-0 capitalize">
                      {stop.status.toLowerCase().replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
