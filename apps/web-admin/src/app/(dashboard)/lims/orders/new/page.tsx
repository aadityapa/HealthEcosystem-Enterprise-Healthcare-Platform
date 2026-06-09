import { Suspense } from 'react';
import { Skeleton } from '@health/design-system';
import NewOrderPageClient from './new-order-client';

export default function NewOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      }
    >
      <NewOrderPageClient />
    </Suspense>
  );
}
