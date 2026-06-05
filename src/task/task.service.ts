import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client'

import { PrismaService } from '../prisma.service'
import { ProjectService } from '../project/project.service'
import { taskInclude } from './constants/task.constans'
import { UpdateTaskOrderDto } from './dto/bulk-update.dto'
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto/task.dto'

type TaskWithResponse = Prisma.TaskGetPayload<{ include: typeof taskInclude }>

@Injectable()
export class TaskService {
	constructor(
		private prisma: PrismaService,
		private projectService: ProjectService
	) {}

	async create(projectId: string, dto: CreateTaskDto): Promise<TaskDto> {
		await this.assertAssigneeIsProjectMember(projectId, dto.assigneeId)

		const task = await this.prisma.task.create({
			data: {
				title: dto.title,
				description: dto.description,
				status: dto.status ?? TaskStatus.TODO,
				priority: dto.priority ?? TaskPriority.MEDIUM,
				dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
				project: { connect: { id: projectId } },
				assignee: dto.assigneeId
					? { connect: { id: dto.assigneeId } }
					: undefined
			},
			include: taskInclude
		})

		return this.formatTaskResponse(task)
	}

	async getById(
		projectId: string,
		id: string,
		timestamps = false
	): Promise<TaskDto> {
		const task = await this.prisma.task.findFirst({
			where: { id, projectId },
			include: taskInclude
		})

		if (!task) {
			throw new NotFoundException('Task not found')
		}

		return this.formatTaskResponse(task, timestamps)
	}

	async getAllByProject(
		projectId: string,
		filters: {
			status?: TaskStatus
			priority?: TaskPriority
			assigneeId?: string
			search?: string
			dueDate?: string
		},
		timestamps = false
	): Promise<TaskDto[]> {
		const { status, priority, assigneeId, search, dueDate } = filters

		const where: Prisma.TaskWhereInput = {
			projectId,
			status: status || undefined,
			priority: priority || undefined,
			assigneeId: assigneeId || undefined,
			dueDate: dueDate ? { equals: new Date(dueDate) } : undefined,
			OR: search
				? [
						{ title: { contains: search, mode: 'insensitive' } },
						{ description: { contains: search, mode: 'insensitive' } }
					]
				: undefined
		}

		const tasks = await this.prisma.task.findMany({
			where,
			include: taskInclude,
			orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }]
		})

		return tasks.map(task => this.formatTaskResponse(task, timestamps))
	}

	async update(
		projectId: string,
		id: string,
		dto: UpdateTaskDto
	): Promise<TaskDto> {
		const existing = await this.prisma.task.findFirst({
			where: { id, projectId },
			select: { id: true }
		})
		if (!existing) throw new NotFoundException('Task not found')

		await this.assertAssigneeIsProjectMember(
			projectId,
			dto.assigneeId ?? undefined
		)

		const data: Prisma.TaskUpdateInput = {
			...(dto.title ? { title: dto.title } : {}),
			...(dto.description !== undefined
				? { description: dto.description }
				: {}),
			...(dto.status ? { status: dto.status } : {}),
			...(dto.priority ? { priority: dto.priority } : {}),
			...(dto.dueDate !== undefined
				? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null }
				: {})
		}

		if (dto.assigneeId !== undefined) {
			data.assignee = dto.assigneeId
				? { connect: { id: dto.assigneeId } }
				: { disconnect: true }
		}

		const updatedTask = await this.prisma.task.update({
			where: { id },
			data,
			include: taskInclude
		})

		return this.formatTaskResponse(updatedTask)
	}

	async updateOrder(projectId: string, dto: UpdateTaskOrderDto): Promise<void> {
		const taskIds = dto.tasks.map(task => task.id)
		const foundCount = await this.prisma.task.count({
			where: {
				projectId,
				id: { in: taskIds }
			}
		})

		if (foundCount !== taskIds.length) {
			throw new BadRequestException(
				'Task order contains tasks outside the project'
			)
		}

		await this.prisma.$transaction(
			dto.tasks.map(task =>
				this.prisma.task.update({
					where: {
						id: task.id
					},
					data: {
						status: task.status,
						position: task.position
					}
				})
			)
		)
	}

	async delete(projectId: string, id: string): Promise<void> {
		const result = await this.prisma.task.deleteMany({
			where: { id, projectId }
		})

		if (result.count === 0) {
			throw new NotFoundException('Task not found')
		}
	}

	private async assertAssigneeIsProjectMember(
		projectId: string,
		assigneeId?: string
	): Promise<void> {
		if (!assigneeId) return

		const membership = await this.projectService.getMembership(
			projectId,
			assigneeId
		)
		if (!membership) {
			throw new BadRequestException('Assignee is not a member of the project')
		}
	}

	private formatTaskResponse(
		task: TaskWithResponse,
		timestamps = false
	): TaskDto {
		if (timestamps) return task

		return {
			id: task.id,
			title: task.title,
			description: task.description,
			status: task.status,
			priority: task.priority,
			dueDate: task.dueDate,
			projectId: task.projectId,
			assigneeId: task.assigneeId,
			position: task.position,
			project: task.project,
			assignee: task.assignee
		}
	}
}
