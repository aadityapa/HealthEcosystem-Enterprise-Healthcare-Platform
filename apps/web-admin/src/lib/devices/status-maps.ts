import type { DeviceStatus, MessageStatus } from '@/types';
import type { StatusVariant } from '@health/design-system';

export const deviceStatusMap: Record<DeviceStatus, { status: StatusVariant; label: string }> = {
  online: { status: 'active', label: 'Online' },
  offline: { status: 'inactive', label: 'Offline' },
  error: { status: 'critical', label: 'Error' },
  maintenance: { status: 'processing', label: 'Maintenance' },
};

export const messageStatusMap: Record<MessageStatus, { status: StatusVariant; label: string }> = {
  queued: { status: 'pending', label: 'Queued' },
  processing: { status: 'processing', label: 'Processing' },
  completed: { status: 'approved', label: 'Completed' },
  failed: { status: 'critical', label: 'Failed' },
};

export const importStatusMap: Record<
  'success' | 'pending' | 'failed',
  { status: StatusVariant; label: string }
> = {
  success: { status: 'approved', label: 'Success' },
  pending: { status: 'pending', label: 'Pending' },
  failed: { status: 'critical', label: 'Failed' },
};
