import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PacksService } from './packs.service';

@ApiTags('Compliance Packs')
@Controller('api/v1/compliance/packs')
export class PacksController {
  constructor(private readonly packsService: PacksService) {}

  @Get()
  @ApiOperation({ summary: 'List compliance packs (HIPAA, GDPR, DPDP, ISO_27001, NABL, CAP, ABDM, SOC2)' })
  list() {
    return this.packsService.list();
  }
}
