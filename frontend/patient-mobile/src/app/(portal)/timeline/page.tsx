'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Calendar,
  FlaskConical,
  Home,
  Loader2,
  Pill,
  Syringe,
} from 'lucide-react';
import { Badge, Card, CardContent, EmptyState } from '@health/design-system';
import { MobileHeader } from '@/components/layout/mobile-header';
import { patientPortalApi } from '@/lib/api/patient-portal';
import { formatDateTime } from '@/lib/mock-data';
import type { TimelineEvent } from '@/types';

const eventIcons: Record<TimelineEvent['type'], typeof Activity> = {
  lab_result: FlaskConical,
  appointment: Calendar,
  prescription: Pill,
  vaccination: Syringe,
  procedure: Activity,
  home_collection: Home,
};

const eventColors: Record<TimelineEvent['type'], string> = {
  lab_result: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  appointment: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  prescription: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  vaccination: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  procedure: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  home_collection: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
};

export default function TimelinePage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['timeline'],
    queryFn: () => patientPortalApi.getTimeline(),
  });

  return (
    <div>
      <MobileHeader title="Health Timeline" subtitle="Your complete health history" />

      <div className="px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !events?.length ? (
          <EmptyState
            icon={Activity}
            title="No events yet"
            description="Your health timeline will build as you use our services"
          />
        ) : (
          <div className="relative space-y-0">
            <div className="absolute left-[1.65rem] top-4 bottom-4 w-px bg-border" />

            {events.map((event, index) => {
              const Icon = eventIcons[event.type];
              return (
                <div key={event.id} className="relative flex gap-4 pb-6">
                  <div
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${eventColors[event.type]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <Card className="flex-1">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{event.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        </div>
                        {event.status && (
                          <Badge variant="outline" className="shrink-0 capitalize text-[10px]">
                            {event.status}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(event.date)}
                      </p>
                      {event.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-[10px]">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {index === events.length - 1 && (
                    <div className="absolute left-[1.65rem] bottom-0 h-6 w-px bg-background" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
