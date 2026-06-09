'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
  StatusBadge,
} from '@health/design-system';
import { Building2, MapPin, Plus } from 'lucide-react';
import { PageTransition } from '@/components/motion/page-transition';
import { PageHeader } from '@/components/layout/page-header';
import { masterDataApi } from '@/lib/api/master-data';

export default function GeographyPage() {
  const { data: states = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['master-geography'],
    queryFn: () => masterDataApi.listGeography(),
  });

  const totalCities = states.reduce((sum, s) => sum + s.cities.length, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          title="States & Cities"
          description={`${states.length} states, ${totalCities} cities configured`}
          actions={
            <Button>
              <Plus className="h-4 w-4" />
              Add State
            </Button>
          }
        />

        {isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load geography data.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : states.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No geography data"
            description="Add states and cities to configure service areas."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {states.map((state) => (
              <Card key={state.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="h-4 w-4 text-primary" />
                      {state.name}
                    </CardTitle>
                    <StatusBadge status="active" label={state.code} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    GST State Code: <span className="font-mono">{state.gstCode}</span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {state.cities.map((city) => (
                      <div
                        key={city.id}
                        className="flex items-center justify-between rounded-lg border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm font-medium">{city.name}</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {city.pincodePrefix}xxx
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
