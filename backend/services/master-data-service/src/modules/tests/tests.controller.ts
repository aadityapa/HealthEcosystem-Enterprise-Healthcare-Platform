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
import { MasterContext } from '@/common/decorators/master.decorators';
import type { MasterRequestContext } from '@/common/context/master-context';
import {
  CreateTestCategoryDto,
  UpdateTestCategoryDto,
  CreateTestDto,
  UpdateTestDto,
  CreateTestParameterDto,
  CreatePricingDto,
  UpdatePricingDto,
  ListTestsQueryDto,
  ListPricingQueryDto,
} from './dto/tests.dto';
import {
  CreateTestCategoryCommand,
  UpdateTestCategoryCommand,
  CreateTestCommand,
  UpdateTestCommand,
  AddTestParameterCommand,
  CreatePricingCommand,
  UpdatePricingCommand,
} from './commands/tests.commands';
import {
  GetTestQuery,
  ListTestsQuery,
  ListCategoriesQuery,
  ListPricingQuery,
} from './queries/tests.queries';

@ApiTags('Master Tests')
@Controller('api/v1/master/tests')
export class TestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'List test categories' })
  listCategories(@MasterContext() ctx: MasterRequestContext) {
    return this.queryBus.execute(new ListCategoriesQuery(ctx));
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create test category' })
  createCategory(
    @MasterContext() ctx: MasterRequestContext,
    @Body() dto: CreateTestCategoryDto,
  ) {
    return this.commandBus.execute(new CreateTestCategoryCommand(ctx, dto));
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update test category' })
  updateCategory(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestCategoryDto,
  ) {
    return this.commandBus.execute(new UpdateTestCategoryCommand(ctx, id, dto));
  }

  @Get('pricing')
  @ApiOperation({ summary: 'List test pricing' })
  listPricing(
    @MasterContext() ctx: MasterRequestContext,
    @Query() filters: ListPricingQueryDto,
  ) {
    return this.queryBus.execute(new ListPricingQuery(ctx, filters));
  }

  @Post('pricing')
  @ApiOperation({ summary: 'Create test pricing' })
  createPricing(
    @MasterContext() ctx: MasterRequestContext,
    @Body() dto: CreatePricingDto,
  ) {
    return this.commandBus.execute(new CreatePricingCommand(ctx, dto));
  }

  @Patch('pricing/:id')
  @ApiOperation({ summary: 'Update test pricing' })
  updatePricing(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePricingDto,
  ) {
    return this.commandBus.execute(new UpdatePricingCommand(ctx, id, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List tests' })
  listTests(
    @MasterContext() ctx: MasterRequestContext,
    @Query() filters: ListTestsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListTestsQuery(ctx, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create test' })
  createTest(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateTestDto) {
    return this.commandBus.execute(new CreateTestCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get test detail' })
  getTest(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetTestQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update test' })
  updateTest(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.commandBus.execute(new UpdateTestCommand(ctx, id, dto));
  }

  @Post(':id/parameters')
  @ApiOperation({ summary: 'Add test parameter' })
  addParameter(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTestParameterDto,
  ) {
    return this.commandBus.execute(new AddTestParameterCommand(ctx, id, dto));
  }
}
