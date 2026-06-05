import {
	Body,
	Controller,
	HttpCode,
	Param,
	Patch,
	UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger'
import { ProjectRole } from '@prisma/client'

import { CurrentUser } from '../auth/decorators/user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { Roles } from '../project/decorators/roles.decorator'
import { ProjectRolesGuard } from '../project/guards/project-routes.guard'
import { CurrentUserContext } from '../user/user.service'
import { UpdateRoleDto } from './dto/role.dto'
import { RoleService } from './role.service'

@ApiTags('project roles')
@ApiBearerAuth()
@Controller('projects/:projectId/roles')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@ApiNoContentResponse()
	@Patch(':userId')
	@HttpCode(204)
	@Roles(ProjectRole.PROJECT_ADMIN)
	async updateRole(
		@Param('projectId') projectId: string,
		@Param('userId') userId: string,
		@CurrentUser() actor: CurrentUserContext,
		@Body() dto: UpdateRoleDto
	): Promise<void> {
		return this.roleService.updateRole(projectId, userId, actor.id, dto)
	}
}
