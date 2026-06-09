import { DeviceVendor } from '@health/db';
import { AdapterRegistry } from './adapter.registry';

describe('AdapterRegistry', () => {
  let registry: AdapterRegistry;

  beforeEach(() => {
    registry = new AdapterRegistry();
  });

  it('returns vendor-specific adapters', () => {
    expect(registry.getAdapter(DeviceVendor.ROCHE).vendor).toBe(DeviceVendor.ROCHE);
    expect(registry.getAdapter(DeviceVendor.ABBOTT).vendor).toBe(DeviceVendor.ABBOTT);
    expect(registry.getAdapter(DeviceVendor.SIEMENS).vendor).toBe(DeviceVendor.SIEMENS);
    expect(registry.getAdapter(DeviceVendor.SYSMEX).vendor).toBe(DeviceVendor.SYSMEX);
    expect(registry.getAdapter(DeviceVendor.BECKMAN_COULTER).vendor).toBe(
      DeviceVendor.BECKMAN_COULTER,
    );
  });

  it('falls back to generic adapter for unknown vendor', () => {
    const adapter = registry.getAdapter('UNKNOWN' as DeviceVendor);
    expect(adapter.vendor).toBe(DeviceVendor.GENERIC);
  });

  it('lists all registered vendors', () => {
    const vendors = registry.listAdapters();
    expect(vendors).toContain(DeviceVendor.ROCHE);
    expect(vendors).toContain(DeviceVendor.GENERIC);
    expect(vendors.length).toBeGreaterThanOrEqual(6);
  });
});
