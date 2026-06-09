import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SignaturesService } from './signatures.service';
import { SignDocumentDto } from './dto/signatures.dto';

@ApiTags('DMS Signatures')
@Controller('api/v1/dms/documents/:id')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post('sign')
  @ApiOperation({ summary: 'Apply digital signature to document' })
  sign(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SignDocumentDto,
  ) {
    return this.signaturesService.sign(ctx, id, dto);
  }

  @Get('signatures')
  @ApiOperation({ summary: 'List document signatures' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.signaturesService.listSignatures(ctx, id);
  }
}
