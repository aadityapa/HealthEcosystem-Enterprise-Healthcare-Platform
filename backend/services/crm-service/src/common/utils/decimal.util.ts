export function toNumber(
  value: { toString(): string } | number | string | null | undefined,
): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateCommission(
  orderAmount: number,
  commissionPct: number,
): number {
  return round2((orderAmount * commissionPct) / 100);
}
