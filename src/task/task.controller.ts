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
import { TaskPriority, TaskStatus } from '@prisma/client'

import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { ProjectRolesGuard } from '../project/guards/project-routes.guard'
import { UpdateTaskOrderDto } from './dto/bulk-update.dto'
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto/task.dto'
import { TaskService } from './task.service'

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('projects/:projectId/tasks')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
export class TaskController {
	constructor(private readonly taskService: TaskService) {}

	@ApiCreatedResponse({ type: TaskDto })
	@Post()
	async create(
		@Param('projectId') projectId: string,
		@Body() dto: CreateTaskDto
	): Promise<TaskDto> {
		return this.taskService.create(projectId, dto)
	}

	@ApiOkResponse({ type: [TaskDto] })
	@Get()
	async getAllByProject(
		@Param('projectId') projectId: string,
		@Query('timestamps') timestamps: boolean,
		@Query('status') status?: TaskStatus,
		@Query('priority') priority?: TaskPriority,
		@Query('assigneeId') assigneeId?: string,
		@Query('search') search?: string,
		@Query('dueDate') dueDate?: string
	): Promise<TaskDto[]> {
		return this.taskService.getAllByProject(
			projectId,
			{
				status,
				priority,
				assigneeId,
				search,
				dueDate
			},
			timestamps
		)
	}

	@ApiOkResponse({ type: TaskDto })
	@Get(':taskId')
	async getById(
		@Param('projectId') projectId: string,
		@Param('taskId') taskId: string,
		@Query('timestamps') timestamps: boolean
	): Promise<TaskDto> {
		return this.taskService.getById(projectId, taskId, timestamps)
	}

	@ApiNoContentResponse()
	@Patch('order')
	@HttpCode(204)
	async updateOrder(
		@Param('projectId') projectId: string,
		@Body() dto: UpdateTaskOrderDto
	): Promise<void> {
		return this.taskService.updateOrder(projectId, dto)
	}

	@ApiOkResponse({ type: TaskDto })
	@Patch(':taskId')
	async update(
		@Param('projectId') projectId: string,
		@Param('taskId') taskId: string,
		@Body() dto: UpdateTaskDto
	): Promise<TaskDto> {
		return this.taskService.update(projectId, taskId, dto)
	}

	@ApiNoContentResponse()
	@Delete(':taskId')
	@HttpCode(204)
	async delete(
		@Param('projectId') projectId: string,
		@Param('taskId') taskId: string
	): Promise<void> {
		return this.taskService.delete(projectId, taskId)
	}
}
