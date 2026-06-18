'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronRight, Syringe } from 'lucide-react';
import { Badge, Card, CardContent } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { fieldApi } from '@/lib/api/field';

export default function CollectPage() {
  const { data } = useQuery({
    queryKey: ['today-route'],
    queryFn: () => fieldApi.getTodayRoute(),
  });

  const pendingStops =
    data?.route?.stops.filter((s) => s.status !== 'COLLECTED') ?? [];

  return (
    <div>
      <MobileHeader title="Collect" subtitle={`${pendingStops.length} pending stops`} />

      <div className="space-y-3 px-4 py-4">
        {pendingStops.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              All samples collected for today
            </CardContent>
          </Card>
        ) : (
          pendingStops.map((stop) => (
            <Link key={stop.id} href={`/stop/${stop.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Syringe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{stop.patientName}</p>
                      <p className="text-xs text-muted-foreground">{stop.address.line1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{stop.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
