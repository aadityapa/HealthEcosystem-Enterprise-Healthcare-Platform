import { haversineMeters, isWithinGeofence, toNumber } from './geofence.util';

describe('geofence.util', () => {
  it('calculates zero distance for same point', () => {
    expect(haversineMeters(19.076, 72.8777, 19.076, 72.8777)).toBe(0);
  });

  it('detects point within geofence radius', () => {
    const within = isWithinGeofence(19.076, 72.8777, 19.076, 72.8777, 500);
    expect(within).toBe(true);
  });

  it('detects point outside geofence radius', () => {
    const within = isWithinGeofence(19.5, 73.5, 19.076, 72.8777, 100);
    expect(within).toBe(false);
  });

  it('converts decimal-like values to numbers', () => {
    expect(toNumber('19.076')).toBe(19.076);
    expect(toNumber(42)).toBe(42);
  });
});
