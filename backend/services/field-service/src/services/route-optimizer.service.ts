import { Injectable } from '@nestjs/common';

export interface OptimizableStop {
  id: string;
  lat: number;
  lng: number;
}

export interface RouteOptimizerOptions {
  startLat?: number;
  startLng?: number;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class RouteOptimizerService {
  optimizeNearestNeighbor(
    stops: OptimizableStop[],
    options: RouteOptimizerOptions = {},
  ): string[] {
    if (stops.length === 0) return [];

    const remaining = new Map(stops.map((s) => [s.id, s]));
    const ordered: string[] = [];

    let currentLat = options.startLat ?? stops[0].lat;
    let currentLng = options.startLng ?? stops[0].lng;

    while (remaining.size > 0) {
      let nearestId: string | null = null;
      let nearestDistance = Infinity;

      for (const [id, stop] of remaining) {
        const distance = haversineKm(currentLat, currentLng, stop.lat, stop.lng);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestId = id;
        }
      }

      if (!nearestId) break;

      const next = remaining.get(nearestId)!;
      ordered.push(nearestId);
      remaining.delete(nearestId);
      currentLat = next.lat;
      currentLng = next.lng;
    }

    return ordered;
  }
}
