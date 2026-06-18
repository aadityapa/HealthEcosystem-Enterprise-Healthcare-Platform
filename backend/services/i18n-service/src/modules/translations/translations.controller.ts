import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TranslationsService } from './translations.service';
import {
  CreateTranslationDto,
  CreateTranslationKeyDto,
  UpdateTranslationDto,
} from './dto/translations.dto';

@ApiTags('I18n - Translations')
@Controller('api/v1/i18n/translations')
export class TranslationsController {
  constructor(private readonly translationsService: TranslationsService) {}

  @Post('keys')
  @ApiOperation({ summary: 'Create translation key' })
  createKey(@Body() dto: CreateTranslationKeyDto) {
    return this.translationsService.createKey(dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create or update translation' })
  create(@Body() dto: CreateTranslationDto) {
    return this.translationsService.upsertTranslation(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List translation keys' })
  @ApiQuery({ name: 'namespace', required: false })
  list(@Query('namespace') namespace?: string) {
    return this.translationsService.list(namespace);
  }

  @Get('bundle/:locale/:namespace')
  @ApiOperation({ summary: 'Get translation bundle for locale and namespace' })
  getBundle(
    @Param('locale') locale: string,
    @Param('namespace') namespace: string,
  ) {
    return this.translationsService.getBundle(locale, namespace);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update translation' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTranslationDto) {
    return this.translationsService.updateTranslation(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete translation' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.translationsService.removeTranslation(id);
  }
}
