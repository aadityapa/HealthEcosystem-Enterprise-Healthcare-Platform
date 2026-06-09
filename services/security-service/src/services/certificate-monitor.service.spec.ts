import { CertificateMonitorService } from './certificate-monitor.service';

describe('CertificateMonitorService', () => {
  let service: CertificateMonitorService;

  beforeEach(() => {
    service = new CertificateMonitorService();
  });

  const daysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  it('returns warning when expiring within 30 days', () => {
    const status = service.assessCertificate({
      id: 'cert-1',
      domain: 'api.example.com',
      validTo: daysFromNow(15),
    });

    expect(status.alertLevel).toBe('warning');
    expect(status.message).toContain('within 30 days');
  });

  it('returns critical when expiring within 7 days', () => {
    const status = service.assessCertificate({
      id: 'cert-2',
      domain: 'portal.example.com',
      validTo: daysFromNow(3),
    });

    expect(status.alertLevel).toBe('critical');
  });

  it('returns ok for certificates with ample validity', () => {
    const status = service.assessCertificate({
      id: 'cert-3',
      domain: 'secure.example.com',
      validTo: daysFromNow(90),
    });

    expect(status.alertLevel).toBe('ok');
  });

  it('filters certificates expiring within given days', () => {
    const certs = [
      { id: 'c1', domain: 'a.com', validTo: daysFromNow(10) },
      { id: 'c2', domain: 'b.com', validTo: daysFromNow(60) },
    ];

    const expiring = service.getExpiringWithinDays(certs, 30);
    expect(expiring).toHaveLength(1);
    expect(expiring[0].domain).toBe('a.com');
  });
});
