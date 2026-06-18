import { Injectable } from '@nestjs/common';
import { DeviceVendor } from '@health/db';
import type { VendorAdapter } from './adapter.types';
import { RocheAdapter } from './roche.adapter';
import { AbbottAdapter } from './abbott.adapter';
import { SiemensAdapter } from './siemens.adapter';
import { SysmexAdapter } from './sysmex.adapter';
import { BeckmanAdapter } from './beckman.adapter';
import { GenericAdapter } from './generic.adapter';

@Injectable()
export class AdapterRegistry {
  private readonly adapters: Map<DeviceVendor, VendorAdapter>;

  constructor() {
    const instances: VendorAdapter[] = [
      new RocheAdapter(),
      new AbbottAdapter(),
      new SiemensAdapter(),
      new SysmexAdapter(),
      new BeckmanAdapter(),
      new GenericAdapter(),
    ];

    this.adapters = new Map(instances.map((a) => [a.vendor, a]));
  }

  getAdapter(vendor: DeviceVendor): VendorAdapter {
    return this.adapters.get(vendor) ?? this.adapters.get(DeviceVendor.GENERIC)!;
  }

  listAdapters(): DeviceVendor[] {
    return Array.from(this.adapters.keys());
  }
}
