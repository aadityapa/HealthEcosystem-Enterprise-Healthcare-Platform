import { LotStatus } from '@health/db';

export function toNumber(value: { toNumber?: () => number } | number | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value.toNumber === 'function') return value.toNumber();
  return Number(value);
}

export function resolveLotStatus(
  availableQty: number,
  reorderLevel: number,
  expiresAt: Date | null | undefined,
  now = new Date(),
): LotStatus {
  if (expiresAt && expiresAt < now) {
    return LotStatus.EXPIRED;
  }
  if (availableQty <= reorderLevel) {
    return LotStatus.LOW_STOCK;
  }
  return LotStatus.AVAILABLE;
}

export function formatSequenceNumber(prefix: string, sequence: number, pad = 5): string {
  return `${prefix}${String(sequence).padStart(pad, '0')}`;
}

export async function nextPoNumber(
  countPo: () => Promise<number>,
): Promise<string> {
  const seq = (await countPo()) + 1;
  return formatSequenceNumber('INV-PO-', seq);
}

export async function nextTransferNumber(
  countTransfer: () => Promise<number>,
): Promise<string> {
  const seq = (await countTransfer()) + 1;
  return formatSequenceNumber('INV-TR-', seq);
}
