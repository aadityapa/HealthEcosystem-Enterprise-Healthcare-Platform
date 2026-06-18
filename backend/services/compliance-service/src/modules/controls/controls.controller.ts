import { Body, Controller, Get, Param, ParseUUIDPipe, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ControlsService } from './controls.service';
import { UpdateControlDto } from './dto/controls.dto';

@ApiTags('Compliance Controls')
@Controller('api/v1/compliance/controls')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get control by id' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.controlsService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Assess and update control status' })
  assess(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateControlDto,
  ) {
    return this.controlsService.assess(id, dto);
  }
}
