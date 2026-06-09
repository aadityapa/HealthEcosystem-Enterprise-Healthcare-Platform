#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const [serviceDir, moduleName, apiPath, prismaModel, idField = 'id'] = process.argv.slice(2);
if (!serviceDir || !moduleName || !apiPath || !prismaModel) {
  console.error('Usage: generate-crud-module.mjs <serviceDir> <moduleName> <apiPath> <prismaModel>');
  process.exit(1);
}

const modDir = path.join(serviceDir, 'src', 'modules', moduleName);
fs.mkdirSync(modDir, { recursive: true });

const pascal = moduleName.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
const prismaCamel = prismaModel.charAt(0).toLowerCase() + prismaModel.slice(1);

const files = {
  [`${moduleName}.module.ts`]: `import { Module } from '@nestjs/common';
import { ${pascal}Controller } from './${moduleName}.controller';
import { ${pascal}Service } from './${moduleName}.service';

@Module({
  controllers: [${pascal}Controller],
  providers: [${pascal}Service],
  exports: [${pascal}Service],
})
export class ${pascal}Module {}
`,
  [`${moduleName}.controller.ts`]: `import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ${pascal}Service } from './${moduleName}.service';
import { Create${pascal}Dto, Update${pascal}Dto } from './dto/${moduleName}.dto';

@ApiTags('${pascal}')
@Controller('${apiPath}')
export class ${pascal}Controller {
  constructor(private readonly service: ${pascal}Service) {}

  @Post()
  @ApiOperation({ summary: 'Create ${moduleName}' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: Create${pascal}Dto) {
    return this.service.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List ${moduleName}' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() pagination: PaginationDto) {
    return this.service.list(ctx, pagination.page ?? 1, pagination.limit ?? 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${moduleName}' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ${moduleName}' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Update${pascal}Dto,
  ) {
    return this.service.update(ctx, id, dto);
  }
}
`,
  [`${moduleName}.service.ts`]: `import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';

@Injectable()
export class ${pascal}Service {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: { tenantId: string; organizationId: string; branchId: string }, dto: Record<string, unknown>) {
    return this.prisma.${prismaCamel}.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        ...(dto as object),
      },
    });
  }

  async list(ctx: { tenantId: string }, page: number, limit: number) {
    const { skip, take } = paginate(page, limit);
    const [items, total] = await Promise.all([
      this.prisma.${prismaCamel}.findMany({
        where: { tenantId: ctx.tenantId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.${prismaCamel}.count({ where: { tenantId: ctx.tenantId } }),
    ]);
    return { items, meta: paginationMeta(total, page, limit) };
  }

  async get(ctx: { tenantId: string }, id: string) {
    const item = await this.prisma.${prismaCamel}.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!item) throw new NotFoundException('${pascal} not found');
    return item;
  }

  async update(ctx: { tenantId: string }, id: string, dto: Record<string, unknown>) {
    await this.get(ctx, id);
    return this.prisma.${prismaCamel}.update({
      where: { ${idField}: id },
      data: dto as object,
    });
  }
}
`,
  [`dto/${moduleName}.dto.ts`]: `import { IsOptional, IsString } from 'class-validator';

export class Create${pascal}Dto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  code?: string;
}

export class Update${pascal}Dto {
  @IsOptional()
  @IsString()
  name?: string;
}
`,
  [`${moduleName}.service.spec.ts`]: `import { ${pascal}Service } from './${moduleName}.service';

describe('${pascal}Service', () => {
  const prisma = {
    ${prismaCamel}: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const service = new ${pascal}Service(prisma as never);
  const ctx = { tenantId: 't1', organizationId: 'o1', branchId: 'b1', userId: 'u1' };

  it('lists items', async () => {
    prisma.${prismaCamel}.findMany.mockResolvedValue([]);
    prisma.${prismaCamel}.count.mockResolvedValue(0);
    const result = await service.list(ctx, 1, 20);
    expect(result.items).toEqual([]);
  });
});
`,
};

for (const [file, content] of Object.entries(files)) {
  const full = path.join(modDir, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}
console.log(`Generated ${moduleName} in ${serviceDir}`);
