import { Injectable } from '@nestjs/common';

export type CertificateAlertLevel = 'ok' | 'warning' | 'critical';

export interface CertificateExpiryStatus {
  certificateId: string;
  domain: string;
  validTo: Date;
  daysUntilExpiry: number;
  alertLevel: CertificateAlertLevel;
  message: string;
}

const WARNING_DAYS = 30;
const CRITICAL_DAYS = 7;

@Injectable()
export class CertificateMonitorService {
  assessCertificate(cert: {
    id: string;
    domain: string;
    validTo: Date;
  }): CertificateExpiryStatus {
    const now = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysUntilExpiry = Math.ceil(
      (cert.validTo.getTime() - now.getTime()) / msPerDay,
    );

    let alertLevel: CertificateAlertLevel = 'ok';
    let message = `Certificate for ${cert.domain} is valid`;

    if (daysUntilExpiry <= 0) {
      alertLevel = 'critical';
      message = `Certificate for ${cert.domain} has expired`;
    } else if (daysUntilExpiry <= CRITICAL_DAYS) {
      alertLevel = 'critical';
      message = `Certificate for ${cert.domain} expires in ${daysUntilExpiry} days`;
    } else if (daysUntilExpiry <= WARNING_DAYS) {
      alertLevel = 'warning';
      message = `Certificate for ${cert.domain} expires within 30 days (${daysUntilExpiry} days remaining)`;
    }

    return {
      certificateId: cert.id,
      domain: cert.domain,
      validTo: cert.validTo,
      daysUntilExpiry,
      alertLevel,
      message,
    };
  }

  assessAll(
    certificates: Array<{ id: string; domain: string; validTo: Date }>,
  ): CertificateExpiryStatus[] {
    return certificates.map((cert) => this.assessCertificate(cert));
  }

  getExpiringWithinDays(
    certificates: Array<{ id: string; domain: string; validTo: Date }>,
    days: number = WARNING_DAYS,
  ): CertificateExpiryStatus[] {
    return this.assessAll(certificates).filter(
      (status) => status.daysUntilExpiry <= days && status.daysUntilExpiry > 0,
    );
  }
}
