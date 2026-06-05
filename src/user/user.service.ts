import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import {
	GlobalRole,
	Prisma,
	TaskPriority,
	TaskStatus,
	type User
} from '@prisma/client'
import { hash } from 'argon2'
import * as dayjs from 'dayjs'

import { PrismaService } from '../prisma.service'
import {
	ProjectSummary,
	TaskSummary,
	UserProfileDto
} from './dto/user-profile.dto'
import { CreateUserDto, UpdateUserDto } from './dto/user.dto'

export interface CurrentUserContext {
	id: string
	role: GlobalRole
}

export interface PublicUser {
	id: string
	email: string
	name: string
	role: GlobalRole
}

const publicUserSelect = {
	id: true,
	email: true,
	name: true,
	role: true
} as const satisfies Prisma.UserSelect

const userWithPasswordSelect = {
	...publicUserSelect,
	password: true
} as const satisfies Prisma.UserSelect

type UserWithPassword = Prisma.UserGetPayload<{
	select: typeof userWithPasswordSelect
}>

@Injectable()
export class UserService {
	constructor(private prisma: PrismaService) {}

	toPublicUser(user: UserWithPassword | User): PublicUser {
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role
		}
	}

	async getPublicById(id: string): Promise<PublicUser | null> {
		return this.prisma.user.findUnique({
			where: { id },
			select: publicUserSelect
		})
	}

	async getById(id: string): Promise<PublicUser | null> {
		return this.getPublicById(id)
	}

	async getVisibleById(
		actor: CurrentUserContext,
		id: string
	): Promise<PublicUser> {
		this.assertSelfOrAdmin(actor, id)
		const user = await this.getPublicById(id)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user
	}

	async getByEmail(email: string): Promise<PublicUser | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: publicUserSelect
		})
	}

	async getByEmailWithPassword(
		email: string
	): Promise<UserWithPassword | null> {
		return this.prisma.user.findUnique({
			where: { email },
			select: userWithPasswordSelect
		})
	}

	async getAllUsers(page = 1, limit = 10): Promise<PublicUser[]> {
		const skip = (page - 1) * limit

		return this.prisma.user.findMany({
			skip,
			take: limit,
			select: publicUserSelect,
			orderBy: { createdAt: 'desc' }
		})
	}

	async getProfile(
		actor: CurrentUserContext,
		userId: string
	): Promise<UserProfileDto> {
		this.assertSelfOrAdmin(actor, userId)

		const now = dayjs()
		const oneMonthAgo = now.subtract(30, 'days').toDate()
		const twoMonthsAgo = now.subtract(60, 'days').toDate()

		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			include: {
				projectRoles: true
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const [
			totalTasks,
			tasksLastMonth,
			tasksPreviousMonth,
			completedTasks,
			completedTasksLastMonth,
			completedTasksPreviousMonth,
			overdueTasks,
			overdueTasksLastMonth,
			overdueTasksPreviousMonth
		] = await Promise.all([
			this.prisma.task.count({ where: { assigneeId: userId } }),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					createdAt: { gte: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					status: 'DONE'
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					status: 'DONE',
					updatedAt: { gte: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					status: 'DONE',
					updatedAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					dueDate: { lte: now.toDate() },
					status: { not: 'DONE' }
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					dueDate: { lte: now.toDate(), gte: oneMonthAgo },
					status: { not: 'DONE' }
				}
			}),
			this.prisma.task.count({
				where: {
					assigneeId: userId,
					dueDate: { lte: now.toDate(), gte: twoMonthsAgo, lt: oneMonthAgo },
					status: { not: 'DONE' }
				}
			})
		])

		return {
			totalProjects: user.projectRoles.length,
			totalTasks,
			totalTasksDifference: tasksLastMonth - tasksPreviousMonth,
			assignedTasks: totalTasks,
			assignedTasksDifference: tasksLastMonth - tasksPreviousMonth,
			completedTasks,
			completedTasksDifference:
				completedTasksLastMonth - completedTasksPreviousMonth,
			overdueTasks,
			overdueTasksDifference: overdueTasksLastMonth - overdueTasksPreviousMonth
		}
	}

	async getTotalTasks(
		actor: CurrentUserContext,
		id: string,
		filters?: {
			projectId?: string
			status?: TaskStatus
			priority?: TaskPriority
			search?: string
			dueDate?: Date
		}
	): Promise<TaskSummary[]> {
		this.assertSelfOrAdmin(actor, id)

		const taskWhere: Prisma.TaskWhereInput = {}

		if (filters?.projectId) taskWhere.projectId = filters.projectId
		if (filters?.status) taskWhere.status = filters.status
		if (filters?.priority) taskWhere.priority = filters.priority
		if (filters?.search) {
			taskWhere.OR = [
				{ title: { contains: filters.search, mode: 'insensitive' } },
				{ description: { contains: filters.search, mode: 'insensitive' } }
			]
		}
		if (filters?.dueDate && !Number.isNaN(filters.dueDate.getTime())) {
			taskWhere.dueDate = { equals: filters.dueDate }
		}

		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				tasks: {
					where: taskWhere,
					include: {
						project: true
					}
				}
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user.tasks.map(task => ({
			id: task.id,
			title: task.title,
			projectId: task.projectId,
			project: {
				id: task.project.id,
				name: task.project.name,
				description: task.project.description,
				ownerId: task.project.ownerId
			},
			projectName: task.project.name,
			status: task.status,
			priority: task.priority,
			dueDate: task.dueDate
		}))
	}

	async getProjects(
		actor: CurrentUserContext,
		id: string
	): Promise<ProjectSummary[]> {
		this.assertSelfOrAdmin(actor, id)

		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				projectRoles: {
					include: {
						project: true
					}
				}
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user.projectRoles.map(projectRole => ({
			id: projectRole.project.id,
			name: projectRole.project.name
		}))
	}

	async getOwnedProjects(
		actor: CurrentUserContext,
		id: string
	): Promise<ProjectSummary[]> {
		this.assertSelfOrAdmin(actor, id)

		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				projectsOwned: true
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		return user.projectsOwned.map(project => ({
			id: project.id,
			name: project.name
		}))
	}

	async createPublicUser(
		dto: Omit<CreateUserDto, 'role'>
	): Promise<PublicUser> {
		const hashedPassword = await hash(dto.password)

		const user = await this.prisma.user.create({
			data: {
				email: dto.email,
				name: dto.name,
				password: hashedPassword,
				role: GlobalRole.USER
			},
			select: publicUserSelect
		})

		return user
	}

	async create(dto: CreateUserDto): Promise<PublicUser> {
		const hashedPassword = await hash(dto.password)

		return this.prisma.user.create({
			data: {
				email: dto.email,
				name: dto.name,
				password: hashedPassword,
				role: dto.role ?? GlobalRole.USER
			},
			select: publicUserSelect
		})
	}

	async update(
		actor: CurrentUserContext,
		id: string,
		dto: UpdateUserDto
	): Promise<PublicUser> {
		this.assertSelfOrAdmin(actor, id)

		const user = await this.getPublicById(id)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		const data: Prisma.UserUpdateInput = {
			...(dto.email ? { email: dto.email } : {}),
			...(dto.name ? { name: dto.name } : {}),
			...(dto.password ? { password: await hash(dto.password) } : {})
		}

		return this.prisma.user.update({
			where: { id },
			data,
			select: publicUserSelect
		})
	}

	async updateRole(id: string, role: GlobalRole): Promise<PublicUser> {
		const user = await this.getPublicById(id)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		return this.prisma.user.update({
			where: { id },
			data: { role },
			select: publicUserSelect
		})
	}

	async delete(id: string): Promise<void> {
		const user = await this.getPublicById(id)

		if (!user) {
			throw new NotFoundException('User not found')
		}

		await this.prisma.user.delete({
			where: { id }
		})
	}

	private assertSelfOrAdmin(
		actor: CurrentUserContext,
		targetUserId: string
	): void {
		if (actor.id === targetUserId || actor.role === GlobalRole.ADMIN) return
		throw new ForbiddenException(
			'You do not have permission to access this user'
		)
	}
}
