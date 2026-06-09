import { NotFoundException } from '@nestjs/common';
import { TicketStatus } from '@health/db';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  const prisma = {
    supportTicket: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: TicketsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TicketsService(prisma as never);
  });

  it('creates support ticket', async () => {
    prisma.supportTicket.count.mockResolvedValue(0);
    prisma.supportTicket.create.mockResolvedValue({
      id: 'tkt-1',
      ticketNumber: 'TKT000001',
      status: TicketStatus.OPEN,
    });

    const result = await service.create(ctx, { subject: 'Login issue' });
    expect(result.ticketNumber).toBe('TKT000001');
  });

  it('updates ticket with resolved timestamp', async () => {
    prisma.supportTicket.findFirst.mockResolvedValue({ id: 'tkt-1' });
    prisma.supportTicket.update.mockResolvedValue({
      id: 'tkt-1',
      status: TicketStatus.RESOLVED,
    });

    const result = await service.update(ctx, 'tkt-1', { status: TicketStatus.RESOLVED });
    expect(result.status).toBe(TicketStatus.RESOLVED);
  });

  it('throws NotFoundException when ticket missing', async () => {
    prisma.supportTicket.findFirst.mockResolvedValue(null);
    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
