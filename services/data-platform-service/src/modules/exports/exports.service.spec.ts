import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExportsService } from './exports.service';

describe('ExportsService', () => {
  let service: ExportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportsService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('regulatory-exports') },
        },
      ],
    }).compile();

    service = module.get(ExportsService);
  });

  it('returns regulatory export stub', () => {
    const result = service.getRegulatoryExport();

    expect(result.reportType).toBe('regulatory');
    expect(result.status).toBe('stub');
    expect(result.downloadUrl).toContain('regulatory-exports');
    expect(result.complianceFrameworks).toContain('HIPAA');
  });
});
