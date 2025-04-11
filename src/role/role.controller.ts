import {
  Controller,
  Patch,
  Param,
  Body,
  HttpCode,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from '../project/decorators/roles.decorator';
import { RoleService } from './role.service';
import { UpdateRoleDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ProjectRolesGuard } from '../project/guards/project-routes.guard';

@Controller('projects/:projectId/roles')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Patch(':userId')
  @HttpCode(204)
  @Auth()
  @Roles('PROJECT_ADMIN', 'MANAGER')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateRole(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<void> {
    return this.roleService.updateRole(projectId, userId, dto);
  }
}