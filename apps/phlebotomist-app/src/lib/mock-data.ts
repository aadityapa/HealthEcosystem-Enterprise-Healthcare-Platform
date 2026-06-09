export async function fetchWithDelay<T>(data: T, delay = 600): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delay));
  return data;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'COLLECTED':
    case 'COMPLETED':
      return 'text-emerald-600';
    case 'IN_PROGRESS':
    case 'EN_ROUTE':
    case 'ARRIVED':
      return 'text-blue-600';
    case 'FAILED':
    case 'CANCELLED':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}
