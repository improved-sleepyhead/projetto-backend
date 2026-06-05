import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseGuards
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiTags
} from '@nestjs/swagger'
import { ProjectRole } from '@prisma/client'

import { CurrentUser } from '../auth/decorators/user.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { CurrentUserContext } from '../user/user.service'
import { Roles } from './decorators/roles.decorator'
import {
	AcceptInviteDto,
	CreateProjectDto,
	InviteLinkDto,
	ProjectDto,
	ProjectMemberDto,
	ProjectStatisticsDto,
	UpdateProjectDto
} from './dto/project.dto'
import { ProjectRolesGuard } from './guards/project-routes.guard'
import { ProjectService } from './project.service'

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
export class ProjectController {
	constructor(private readonly projectService: ProjectService) {}

	@ApiCreatedResponse({ type: ProjectDto })
	@Post()
	async create(
		@Body() dto: CreateProjectDto,
		@CurrentUser('id') userId: string
	): Promise<ProjectDto> {
		return this.projectService.create(dto, userId)
	}

	@ApiOkResponse({ type: ProjectDto })
	@Get(':id')
	async getById(
		@Param('id') id: string,
		@Query('includeTimestamps') includeTimestamps: boolean,
		@CurrentUser('id') userId: string
	): Promise<ProjectDto> {
		return this.projectService.getById(id, userId, includeTimestamps)
	}

	@ApiOkResponse({ type: ProjectDto })
	@Roles(ProjectRole.PROJECT_ADMIN)
	@Patch(':id')
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateProjectDto
	): Promise<ProjectDto> {
		return this.projectService.update(id, dto)
	}

	@ApiNoContentResponse()
	@Roles(ProjectRole.PROJECT_ADMIN)
	@Delete(':id')
	@HttpCode(204)
	async delete(@Param('id') id: string): Promise<void> {
		return this.projectService.delete(id)
	}

	@ApiCreatedResponse({ type: ProjectDto })
	@Roles(ProjectRole.PROJECT_ADMIN, ProjectRole.MANAGER)
	@Post(':projectId/members/:userId')
	async addMember(
		@Param('projectId') projectId: string,
		@Param('userId') userId: string
	): Promise<ProjectDto> {
		return this.projectService.addMember(projectId, userId)
	}

	@ApiOkResponse({ type: ProjectStatisticsDto })
	@Get(':id/statistics')
	async getProjectStatistics(
		@Param('id') projectId: string
	): Promise<ProjectStatisticsDto> {
		return this.projectService.getStatistics(projectId)
	}

	@ApiCreatedResponse({ type: InviteLinkDto })
	@Roles(ProjectRole.PROJECT_ADMIN, ProjectRole.MANAGER)
	@Post(':projectId/invite-link')
	async generateInviteLink(
		@Param('projectId') projectId: string,
		@CurrentUser('id') issuerId: string
	): Promise<InviteLinkDto> {
		const inviteLink = await this.projectService.generateInviteLink(
			projectId,
			issuerId
		)
		return { inviteLink }
	}

	@ApiCreatedResponse({ type: ProjectDto })
	@Post('accept-invite')
	async acceptInvite(
		@Body() dto: AcceptInviteDto,
		@CurrentUser('id') userId: string
	): Promise<ProjectDto> {
		return this.projectService.joinByInviteToken(dto.token, userId)
	}

	@ApiNoContentResponse()
	@Roles(ProjectRole.PROJECT_ADMIN, ProjectRole.MANAGER)
	@Delete(':projectId/members/:userId')
	@HttpCode(204)
	async removeMember(
		@Param('projectId') projectId: string,
		@Param('userId') userId: string,
		@CurrentUser() actor: CurrentUserContext
	): Promise<void> {
		await this.projectService.removeMember(projectId, userId, actor.id)
	}

	@ApiOkResponse({ type: [ProjectMemberDto] })
	@Get(':projectId/members')
	async getAllMembers(
		@Param('projectId') projectId: string
	): Promise<ProjectMemberDto[]> {
		return this.projectService.getAllMembers(projectId)
	}
}
