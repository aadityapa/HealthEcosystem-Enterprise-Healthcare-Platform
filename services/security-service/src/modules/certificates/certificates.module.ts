import { Module } from '@nestjs/common';
import { SecurityServicesModule } from '@/services/security-services.module';
import { CertificatesController } from './certificates.controller';
import { CertificatesService } from './certificates.service';

@Module({
  imports: [SecurityServicesModule],
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}
