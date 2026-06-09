'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Navigation } from 'lucide-react';
import { Badge, Button, Card, CardContent, StatCard } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { fieldApi } from '@/lib/api/field';
import { formatDate, formatTime } from '@/lib/mock-data';

export default function TodayRoutePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['today-route'],
    queryFn: () => fieldApi.getTodayRoute(),
  });

  const route = data?.route;

  return (
    <div>
      <MobileHeader showGreeting />

      <div className="space-y-6 px-4 py-4">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : route ? (
          <>
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Today&apos;s Route</p>
                    <p className="font-mono text-sm font-semibold">{route.routeNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(route.routeDate)}</p>
                  </div>
                  <Badge variant={route.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                    {route.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <StatCard title="Total Stops" value={route.totalStops} icon={MapPin} className="p-4" />
              <StatCard title="Completed" value={route.completedStops} icon={Navigation} className="p-4" />
            </div>

            {data?.nextStop && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-primary">Next Stop</p>
                  <p className="mt-1 font-semibold">{data.nextStop.patientName}</p>
                  <p className="text-sm text-muted-foreground">{data.nextStop.address.line1}</p>
                  {data.nextStop.scheduledAt && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(data.nextStop.scheduledAt)}
                    </p>
                  )}
                  <Button asChild className="mt-3 w-full" size="sm">
                    <Link href={`/stop/${data.nextStop.id}`}>Start Collection</Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold">All Stops</h2>
                <Link
                  href={`/route/${route.id}`}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  View route
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {route.stops.slice(0, 3).map((stop) => (
                  <Link key={stop.id} href={`/stop/${stop.id}`}>
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardContent className="flex items-center justify-between p-3">
                        <div>
                          <p className="text-sm font-medium">
                            #{stop.stopOrder} {stop.patientName}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {stop.status.toLowerCase().replace('_', ' ')}
                          </p>
                        </div>
                        <Badge variant="outline">{stop.status}</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No route assigned for today
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
