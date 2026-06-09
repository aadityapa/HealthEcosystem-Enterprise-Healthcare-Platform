import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
export { PrismaClient };

export async function setTenantContext(
  tenantId: string,
  organizationId?: string,
  branchId?: string,
): Promise<void> {
  await prisma.$executeRawUnsafe(
    `SELECT set_config('app.current_tenant', $1, true)`,
    tenantId,
  );
  if (organizationId) {
    await prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_organization', $1, true)`,
      organizationId,
    );
  }
  if (branchId) {
    await prisma.$executeRawUnsafe(
      `SELECT set_config('app.current_branch', $1, true)`,
      branchId,
    );
  }
}

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
