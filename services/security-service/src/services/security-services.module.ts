import { Module } from '@nestjs/common';
import { ThreatDetectorService } from './threat-detector.service';
import { CertificateMonitorService } from './certificate-monitor.service';

@Module({
  providers: [ThreatDetectorService, CertificateMonitorService],
  exports: [ThreatDetectorService, CertificateMonitorService],
})
export class SecurityServicesModule {}
