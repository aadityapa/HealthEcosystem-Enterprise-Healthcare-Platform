import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import {
  CreateTestCategoryDto,
  UpdateTestCategoryDto,
  CreateTestDto,
  UpdateTestDto,
  CreateTestParameterDto,
  ListTestsQueryDto,
} from './dto/test-master.dto';
import {
  CreateTestCategoryCommand,
  UpdateTestCategoryCommand,
  CreateTestCommand,
  UpdateTestCommand,
  AddTestParameterCommand,
  GetTestQuery,
  ListTestsQuery,
  ListCategoriesQuery,
} from './commands/test-master.commands';

@ApiTags('Tests')
@Controller('api/v1/lims/tests')
export class TestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'List test categories' })
  listCategories(@LimsContext() ctx: LimsRequestContext) {
    return this.queryBus.execute(new ListCategoriesQuery(ctx));
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create test category' })
  createCategory(
    @LimsContext() ctx: LimsRequestContext,
    @Body() dto: CreateTestCategoryDto,
  ) {
    return this.commandBus.execute(new CreateTestCategoryCommand(ctx, dto));
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update test category' })
  updateCategory(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestCategoryDto,
  ) {
    return this.commandBus.execute(new UpdateTestCategoryCommand(ctx, id, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List tests' })
  listTests(
    @LimsContext() ctx: LimsRequestContext,
    @Query() filters: ListTestsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListTestsQuery(ctx, { ...filters, page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create test' })
  createTest(@LimsContext() ctx: LimsRequestContext, @Body() dto: CreateTestDto) {
    return this.commandBus.execute(new CreateTestCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test detail' })
  getTest(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetTestQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update test' })
  updateTest(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.commandBus.execute(new UpdateTestCommand(ctx, id, dto));
  }

  @Post(':id/parameters')
  @ApiOperation({ summary: 'Add test parameter' })
  addParameter(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTestParameterDto,
  ) {
    return this.commandBus.execute(new AddTestParameterCommand(ctx, id, dto));
  }
}
