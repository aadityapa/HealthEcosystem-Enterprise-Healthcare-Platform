import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';
import { CollectPaymentDto, ProcessRefundDto } from './dto/payments.dto';
import {
  CollectPaymentCommand,
  ProcessRefundCommand,
  VerifyWebhookCommand,
} from './commands/payments.commands';

interface RawBodyRequest extends Request {
  rawBody?: Buffer;
}

@ApiTags('Payments')
@Controller('api/v1/billing')
export class PaymentsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('invoices/:id/payments')
  @ApiOperation({ summary: 'Collect payment for invoice' })
  collect(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) invoiceId: string,
    @Body() dto: CollectPaymentDto,
  ) {
    return this.commandBus.execute(new CollectPaymentCommand(ctx, invoiceId, dto));
  }

  @Post('payments/:id/refund')
  @ApiOperation({ summary: 'Process payment refund' })
  refund(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) paymentId: string,
    @Body() dto: ProcessRefundDto,
  ) {
    return this.commandBus.execute(new ProcessRefundCommand(ctx, paymentId, dto));
  }

  @Post('payments/webhook/:provider')
  @ApiOperation({ summary: 'Payment gateway webhook' })
  webhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest,
    @Body() body: unknown,
  ) {
    return this.commandBus.execute(
      new VerifyWebhookCommand(provider, req.headers as Record<string, string>, body, req.rawBody),
    );
  }
}
