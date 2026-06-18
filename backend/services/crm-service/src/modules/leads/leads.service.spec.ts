import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LeadStatus } from '@health/db';
import { LeadsService } from './leads.service';
import { PRISMA } from '@/database/database.module';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      salesLead: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
      },
      salesActivity: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get(LeadsService);
  });

  it('creates sales lead with generated lead number', async () => {
    prisma.salesLead.create.mockResolvedValue({
      id: 'lead-1',
      leadNumber: 'LD000001',
      contactName: 'Acme Corp',
      status: LeadStatus.NEW,
    });

    const result = await service.createLead(ctx, {
      contactName: 'Acme Corp',
      company: 'Acme',
    });

    expect(result.leadNumber).toBe('LD000001');
  });

  it('logs activity and updates lead status to CONTACTED', async () => {
    prisma.salesLead.findFirst.mockResolvedValue({
      id: 'lead-1',
      tenantId: ctx.tenantId,
      activities: [],
    });
    prisma.salesActivity.create.mockResolvedValue({
      id: 'activity-1',
      activityType: 'CALL',
    });
    prisma.salesLead.update.mockResolvedValue({
      id: 'lead-1',
      status: LeadStatus.CONTACTED,
    });

    const result = await service.logActivity(ctx, 'lead-1', {
      activityType: 'CALL',
      notes: 'Follow-up scheduled',
    });

    expect(result.activityType).toBe('CALL');
    expect(prisma.salesLead.update).toHaveBeenCalledWith({
      where: { id: 'lead-1' },
      data: { status: LeadStatus.CONTACTED },
    });
  });

  it('throws NotFoundException when lead is missing', async () => {
    prisma.salesLead.findFirst.mockResolvedValue(null);

    await expect(service.getLead(ctx, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
