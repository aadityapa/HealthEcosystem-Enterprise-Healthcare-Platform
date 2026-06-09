import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';

class CreateSurchargeRuleDto {
  @ApiProperty()
  @IsString()
  surchargeType!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  percent?: number;
}

@ApiTags('Surcharges')
@Controller('api/v1/billing/surcharges')
export class SurchargesController {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  @Post('rules')
  @ApiOperation({ summary: 'Create surcharge rule' })
  createRule(@BillingContext() ctx: BillingRequestContext, @Body() dto: CreateSurchargeRuleDto) {
    return this.prisma.surchargeRule.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        surchargeType: dto.surchargeType,
        name: dto.name,
        amount: dto.amount,
        percent: dto.percent,
      },
    });
  }

  @Get('rules')
  @ApiOperation({ summary: 'List surcharge rules' })
  listRules(@BillingContext() ctx: BillingRequestContext) {
    return this.prisma.surchargeRule.findMany({
      where: { tenantId: ctx.tenantId, organizationId: ctx.organizationId, isActive: true },
      orderBy: { surchargeType: 'asc' },
    });
  }
}
