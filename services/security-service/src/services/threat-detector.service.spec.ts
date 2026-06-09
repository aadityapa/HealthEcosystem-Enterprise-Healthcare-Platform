import { ThreatDetectorService } from './threat-detector.service';

describe('ThreatDetectorService', () => {
  let service: ThreatDetectorService;

  beforeEach(() => {
    service = new ThreatDetectorService();
    service.resetCounters();
  });

  const failedLogin = (ip: string) => ({
    eventType: 'auth.login.failed',
    source: 'auth-service',
    severity: 'medium',
    message: 'Failed login attempt',
    sourceIp: ip,
  });

  it('detects brute force after threshold', () => {
    const ip = '203.0.1.50';
    let results: ReturnType<ThreatDetectorService['detect']> = [];

    for (let i = 0; i < 5; i++) {
      results = service.detect([failedLogin(ip)]);
    }

    expect(results).toHaveLength(1);
    expect(results[0].ruleName).toBe('brute_force');
    expect(results[0].threatLevel).toBe('HIGH');
  });

  it('detects suspicious IP from known range', () => {
    const results = service.detect([
      {
        eventType: 'http.request',
        source: 'gateway',
        severity: 'low',
        message: 'Inbound request',
        sourceIp: '10.99.12.34',
      },
    ]);

    expect(results).toHaveLength(1);
    expect(results[0].ruleName).toBe('suspicious_ip');
    expect(results[0].threatLevel).toBe('MEDIUM');
  });

  it('detects rate spike after threshold', () => {
    const ip = '8.8.8.8';
    let results: ReturnType<ThreatDetectorService['detect']> = [];

    for (let i = 0; i < 100; i++) {
      results = service.detect([
        {
          eventType: 'api.call',
          source: 'api-gateway',
          severity: 'info',
          message: 'API call',
          sourceIp: ip,
        },
      ]);
    }

    expect(results).toHaveLength(1);
    expect(results[0].ruleName).toBe('rate_spike');
    expect(results[0].threatLevel).toBe('CRITICAL');
  });

  it('returns empty when no rules match', () => {
    const results = service.detect([
      {
        eventType: 'health.check',
        source: 'monitor',
        severity: 'info',
        message: 'Service healthy',
        sourceIp: '1.2.3.4',
      },
    ]);

    expect(results).toHaveLength(0);
  });
});
