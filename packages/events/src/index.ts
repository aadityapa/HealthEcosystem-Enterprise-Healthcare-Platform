import { v4 as uuidv4 } from 'uuid';
import type { DomainEvent } from '@health/shared-types';

export interface EventPublisher {
  publish<T>(event: DomainEvent<T>): Promise<void>;
}

export function createEvent<T>(
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  tenantId: string,
  payload: T,
  options?: {
    organizationId?: string;
    branchId?: string;
    userId?: string;
    version?: number;
  },
): DomainEvent<T> {
  return {
    eventId: uuidv4(),
    eventType,
    aggregateId,
    aggregateType,
    tenantId,
    organizationId: options?.organizationId,
    branchId: options?.branchId,
    userId: options?.userId,
    payload,
    occurredAt: new Date().toISOString(),
    version: options?.version ?? 1,
  };
}

export class InMemoryEventPublisher implements EventPublisher {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<void>>> = new Map();

  on(eventType: string, handler: (event: DomainEvent) => Promise<void>): void {
    const existing = this.handlers.get(eventType) ?? [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async publish<T>(event: DomainEvent<T>): Promise<void> {
    const handlers = this.handlers.get(event.eventType) ?? [];
    await Promise.all(handlers.map((h) => h(event as DomainEvent)));
  }
}

export * from '@health/shared-types';
