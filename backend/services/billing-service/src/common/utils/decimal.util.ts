export function toNumber(value: { toString(): string } | number | string | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : Number(value);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function extractStateCode(gstin: string | null | undefined): string | null {
  if (!gstin || gstin.length < 2) return null;
  return gstin.substring(0, 2);
}

export function formatDatePart(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}
