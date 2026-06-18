import { StatusBadge } from '@health/design-system';

type BadgeStatus = 'pending' | 'processing' | 'approved' | 'critical' | 'inactive';

export function mapToBadgeStatus(value: string): BadgeStatus {
  if (['active', 'approved', 'completed', 'paid', 'fulfilled', 'final', 'finalized', 'resolved', 'online', 'present'].includes(value)) {
    return 'approved';
  }
  if (['pending', 'planned', 'scheduled', 'new', 'waiting', 'draft', 'upcoming'].includes(value)) {
    return 'pending';
  }
  if (['in-progress', 'processing', 'confirmed', 'reading', 'preliminary', 'on-route', 'moving', 'ongoing'].includes(value)) {
    return 'processing';
  }
  if (['critical', 'stat', 'high', 'urgent', 'refunded', 'abandoned'].includes(value)) {
    return 'critical';
  }
  return 'inactive';
}

export function GenericStatusBadge({ value }: { value: string }) {
  return <StatusBadge status={mapToBadgeStatus(value)} label={value} />;
}
