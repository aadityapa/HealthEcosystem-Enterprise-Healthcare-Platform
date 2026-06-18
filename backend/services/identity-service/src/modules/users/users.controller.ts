import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, PermissionsGuard } from '@/common/guards/auth.guards';
import { RequirePermissions, CurrentUser } from '@/common/decorators/auth.decorators';
import type { JwtPayload } from '@health/shared-types';

@ApiTags('Users')
@Controller('api/v1/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  @Get()
  @RequirePermissions('admin.user.manage')
  list(@CurrentUser() user: JwtPayload) {
    return { success: true, data: [], meta: { tenantId: user.tenantId } };
  }
}
