import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseIntPipe,
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
import { GlobalRole } from '@prisma/client'

import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { Roles } from 'src/project/decorators/roles.decorator'

import {
	ProjectSummary,
	TaskSummary,
	UserProfileDto
} from './dto/user-profile.dto'
import {
	CreateUserDto,
	UpdateUserDto,
	UpdateUserRoleDto,
	UserDto
} from './dto/user.dto'
import { GlobalRolesGuard } from './guards/user-routes.guard'
import { CurrentUserContext, UserService } from './user.service'

@ApiTags('users')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard, GlobalRolesGuard)
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiOkResponse({ type: UserDto })
	@Get('current')
	async getCurrentUser(
		@CurrentUser() user: CurrentUserContext
	): Promise<UserDto | null> {
		return this.userService.getById(user.id)
	}

	@ApiOkResponse({ type: [UserDto] })
	@Roles(GlobalRole.ADMIN)
	@Get()
	async getAllUsers(
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
	): Promise<UserDto[]> {
		return this.userService.getAllUsers(page, limit)
	}

	@ApiCreatedResponse({ type: UserDto })
	@Roles(GlobalRole.ADMIN)
	@Post()
	async create(@Body() dto: CreateUserDto): Promise<UserDto> {
		return this.userService.create(dto)
	}

	@ApiOkResponse({ type: UserDto })
	@Get(':id')
	async getById(
		@CurrentUser() actor: CurrentUserContext,
		@Param('id') id: string
	): Promise<UserDto> {
		return this.userService.getVisibleById(actor, id)
	}

	@ApiOkResponse({ type: UserProfileDto })
	@Get(':id/profile')
	async getProfile(
		@CurrentUser() actor: CurrentUserContext,
		@Param('id') id: string
	): Promise<UserProfileDto> {
		return this.userService.getProfile(actor, id)
	}

	@ApiOkResponse({ type: [TaskSummary] })
	@Get(':id/tasks')
	async getTotalTasks(
		@CurrentUser() actor: CurrentUserContext,
		@Param('id') id: string
	): Promise<TaskSummary[]> {
		return this.userService.getTotalTasks(actor, id)
	}

	@ApiOkResponse({ type: [ProjectSummary] })
	@Get(':id/projects')
	async getProjects(
		@CurrentUser() actor: CurrentUserContext,
		@Param('id') id: string
	): Promise<ProjectSummary[]> {
		return this.userService.getProjects(actor, id)
	}

	@ApiOkResponse({ type: [ProjectSummary] })
	@Get(':id/owned-projects')
	async getOwnedProjects(
		@CurrentUser() actor: CurrentUserContext,
		@Param('id') id: string
	): Promise<ProjectSummary[]> {
		return this.userService.getOwnedProjects(actor, id)
	}

	@ApiOkResponse({ type: UserDto })
	@Patch(':id')
	async update(
		@CurrentUser() actor: CurrentUserContext,
		@Param('id') id: string,
		@Body() dto: UpdateUserDto
	): Promise<UserDto> {
		return this.userService.update(actor, id, dto)
	}

	@ApiOkResponse({ type: UserDto })
	@Roles(GlobalRole.ADMIN)
	@Patch(':id/role')
	async updateRole(
		@Param('id') id: string,
		@Body() dto: UpdateUserRoleDto
	): Promise<UserDto> {
		return this.userService.updateRole(id, dto.role)
	}

	@ApiNoContentResponse()
	@Roles(GlobalRole.ADMIN)
	@Delete(':id')
	@HttpCode(204)
	async delete(@Param('id') id: string): Promise<void> {
		return this.userService.delete(id)
	}
}
