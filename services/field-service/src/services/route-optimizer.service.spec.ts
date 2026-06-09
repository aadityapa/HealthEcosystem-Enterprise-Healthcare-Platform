import { RouteOptimizerService } from './route-optimizer.service';

describe('RouteOptimizerService', () => {
  let service: RouteOptimizerService;

  beforeEach(() => {
    service = new RouteOptimizerService();
  });

  it('returns empty array for no stops', () => {
    expect(service.optimizeNearestNeighbor([])).toEqual([]);
  });

  it('returns single stop id unchanged', () => {
    const stops = [{ id: 'a', lat: 19.076, lng: 72.8777 }];
    expect(service.optimizeNearestNeighbor(stops)).toEqual(['a']);
  });

  it('orders stops by nearest neighbor from start point', () => {
    const stops = [
      { id: 'near', lat: 19.08, lng: 72.88 },
      { id: 'far', lat: 19.2, lng: 73.0 },
      { id: 'mid', lat: 19.1, lng: 72.9 },
    ];

    const order = service.optimizeNearestNeighbor(stops, {
      startLat: 19.076,
      startLng: 72.8777,
    });

    expect(order[0]).toBe('near');
    expect(order).toHaveLength(3);
    expect(new Set(order)).toEqual(new Set(['near', 'mid', 'far']));
  });

  it('visits every stop exactly once', () => {
    const stops = [
      { id: 's1', lat: 12.97, lng: 77.59 },
      { id: 's2', lat: 12.98, lng: 77.6 },
      { id: 's3', lat: 12.99, lng: 77.61 },
      { id: 's4', lat: 13.0, lng: 77.62 },
    ];

    const order = service.optimizeNearestNeighbor(stops);
    expect(order).toHaveLength(4);
    expect(new Set(order)).toEqual(new Set(['s1', 's2', 's3', 's4']));
  });

  it('prefers closer stop when two candidates exist', () => {
    const stops = [
      { id: 'close', lat: 19.077, lng: 72.878 },
      { id: 'distant', lat: 19.5, lng: 73.5 },
    ];

    const order = service.optimizeNearestNeighbor(stops, {
      startLat: 19.076,
      startLng: 72.8777,
    });

    expect(order[0]).toBe('close');
  });
});
