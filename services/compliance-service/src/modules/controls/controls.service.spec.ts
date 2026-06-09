import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ControlsService } from './controls.service';
import { PRISMA } from '@/database/database.module';

describe('ControlsService', () => {
  let service: ControlsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      complianceControl: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ControlsService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(ControlsService);
  });

  it('gets control by id', async () => {
    prisma.complianceControl.findUnique.mockResolvedValue({
      id: 'ctrl-1',
      controlCode: 'HIPAA-164.308',
    });

    const result = await service.getById('ctrl-1');
    expect(result.controlCode).toBe('HIPAA-164.308');
  });

  it('assesses control status', async () => {
    prisma.complianceControl.findUnique.mockResolvedValue({ id: 'ctrl-1' });
    prisma.complianceControl.update.mockResolvedValue({
      id: 'ctrl-1',
      status: 'COMPLIANT',
    });

    const result = await service.assess('ctrl-1', { status: 'COMPLIANT' });
    expect(result.status).toBe('COMPLIANT');
  });

  it('throws NotFoundException for missing control', async () => {
    prisma.complianceControl.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
  });
});
