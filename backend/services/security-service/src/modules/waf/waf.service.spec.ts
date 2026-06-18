import { WafService } from './waf.service';

describe('WafService', () => {
  let service: WafService;

  beforeEach(() => {
    service = new WafService();
  });

  it('returns WAF status with stub rules', () => {
    const status = service.getStatus();

    expect(status.enabled).toBe(true);
    expect(status.rules.length).toBeGreaterThan(0);
    expect(status.frameworks).toContain('SOC 2');
  });

  it('blocks an IP address', () => {
    const result = service.blockIp('192.168.1.100', 'Brute force detected');

    expect(result.blocked).toBe(true);
    expect(result.entry.ip).toBe('192.168.1.100');
    expect(service.getStatus().blockedIpCount).toBe(1);
  });
});
