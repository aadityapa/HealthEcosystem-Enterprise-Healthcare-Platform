import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ModalityType } from '@health/db';
import { DicomService } from './dicom.service';
import { DicomParserService } from '@/services/dicom-parser.service';

describe('DicomService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    radiologyStudy: { findFirst: jest.fn() },
    dicomSeries: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    dicomInstance: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  };

  const dicomParser = {
    parseBuffer: jest.fn(),
  };

  let service: DicomService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DicomService(prisma as never, dicomParser as unknown as DicomParserService);
  });

  it('stores DICOM instance', async () => {
    dicomParser.parseBuffer.mockReturnValue({
      studyInstanceUid: '1.2.3',
      seriesInstanceUid: '1.2.4',
      sopInstanceUid: '1.2.5',
      modality: ModalityType.CT,
    });
    prisma.radiologyStudy.findFirst.mockResolvedValue({
      id: 'study-1',
      modality: ModalityType.CT,
    });
    prisma.dicomSeries.findFirst.mockResolvedValue(null);
    prisma.dicomSeries.create.mockResolvedValue({ id: 'series-1' });
    prisma.dicomInstance.findFirst.mockResolvedValue(null);
    prisma.dicomInstance.create.mockResolvedValue({ id: 'inst-1' });
    prisma.dicomSeries.update.mockResolvedValue({});

    const result = await service.store(ctx, { data: Buffer.from('test').toString('base64') });

    expect(result.duplicate).toBe(false);
    expect(prisma.dicomInstance.create).toHaveBeenCalled();
  });

  it('throws when study not found', async () => {
    dicomParser.parseBuffer.mockReturnValue({
      studyInstanceUid: '1.2.3',
      seriesInstanceUid: '1.2.4',
      sopInstanceUid: '1.2.5',
    });
    prisma.radiologyStudy.findFirst.mockResolvedValue(null);

    await expect(
      service.store(ctx, { data: Buffer.from('test').toString('base64') }),
    ).rejects.toThrow(NotFoundException);
  });

  it('requires seriesId or studyId for listing', async () => {
    await expect(service.listInstances(ctx, {})).rejects.toThrow(BadRequestException);
  });
});
