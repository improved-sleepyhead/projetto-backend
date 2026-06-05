import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	GoneException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Prisma, ProjectRole, type ProjectUser } from '@prisma/client'
import { createHash, randomBytes } from 'crypto'
import * as dayjs from 'dayjs'

import { PrismaService } from '../prisma.service'
import { projectSelect } from './constants/project.constants'
import {
	CreateProjectDto,
	ProjectDto,
	ProjectMemberDto,
	ProjectStatisticsDto,
	UpdateProjectDto
} from './dto/project.dto'

type ProjectWithResponse = Prisma.ProjectGetPayload<{
	select: typeof projectSelect
}>

interface InviteRow {
	id: string
	role: ProjectRole
	project_id: string
	issuer_id: string
	used_by_id: string | null
	expires_at: Date
	used_at: Date | null
	revoked_at: Date | null
}

@Injectable()
export class ProjectService {
	constructor(private prisma: PrismaService) {}

	async getMembership(
		projectId: string,
		userId: string
	): Promise<ProjectUser | null> {
		return this.prisma.projectUser.findUnique({
			where: {
				userId_projectId: {
					userId,
					projectId
				}
			}
		})
	}

	async getUserRole(projectId: string, userId: string): Promise<ProjectRole> {
		const projectUser = await this.getMembership(projectId, userId)

		if (!projectUser) {
			throw new ForbiddenException('You do not have access to this project')
		}

		return projectUser.role
	}

	async create(dto: CreateProjectDto, ownerId: string): Promise<ProjectDto> {
		const project = await this.prisma.project.create({
			data: {
				name: dto.name,
				description: dto.description,
				owner: {
					connect: { id: ownerId }
				},
				members: {
					create: [
						{
							userId: ownerId,
							role: ProjectRole.PROJECT_ADMIN
						}
					]
				}
			},
			select: projectSelect
		})

		return this.formatProjectResponse(project)
	}

	async getById(
		id: string,
		userId: string,
		includeTimestamps = false
	): Promise<ProjectDto> {
		await this.assertMember(id, userId)

		const project = await this.prisma.project.findUnique({
			where: { id },
			select: projectSelect
		})

		if (!project) {
			throw new NotFoundException('Project not found')
		}

		return this.formatProjectResponse(project, includeTimestamps)
	}

	async getStatistics(projectId: string): Promise<ProjectStatisticsDto> {
		const now = dayjs()
		const oneMonthAgo = now.subtract(30, 'days').toDate()
		const twoMonthsAgo = now.subtract(60, 'days').toDate()

		const [
			totalTasks,
			tasksLastMonth,
			tasksPreviousMonth,
			assignedTasks,
			assignedTasksLastMonth,
			assignedTasksPreviousMonth,
			completedTasks,
			completedTasksLastMonth,
			completedTasksPreviousMonth,
			overdueTasks,
			overdueTasksLastMonth,
			overdueTasksPreviousMonth,
			incompleteTasks,
			incompleteTasksLastMonth,
			incompleteTasksPreviousMonth
		] = await Promise.all([
			this.prisma.task.count({ where: { projectId } }),
			this.prisma.task.count({
				where: {
					projectId,
					createdAt: { gte: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: { projectId, assigneeId: { not: null } }
			}),
			this.prisma.task.count({
				where: {
					projectId,
					assigneeId: { not: null },
					createdAt: { gte: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					assigneeId: { not: null },
					createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: { projectId, status: 'DONE' }
			}),
			this.prisma.task.count({
				where: {
					projectId,
					status: 'DONE',
					updatedAt: { gte: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					status: 'DONE',
					updatedAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					dueDate: { lte: now.toDate() },
					status: { not: 'DONE' }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					dueDate: { lte: now.toDate(), gte: oneMonthAgo },
					status: { not: 'DONE' }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					dueDate: { lte: now.toDate(), gte: twoMonthsAgo, lt: oneMonthAgo },
					status: { not: 'DONE' }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					status: { not: 'DONE' }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					status: { not: 'DONE' },
					createdAt: { gte: oneMonthAgo }
				}
			}),
			this.prisma.task.count({
				where: {
					projectId,
					status: { not: 'DONE' },
					createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo }
				}
			})
		])

		return {
			totalTasks,
			assignedTasks,
			completedTasks,
			overdueTasks,
			incompleteTasks,
			totalTasksDifference: tasksLastMonth - tasksPreviousMonth,
			assignedTasksDifference:
				assignedTasksLastMonth - assignedTasksPreviousMonth,
			completedTasksDifference:
				completedTasksLastMonth - completedTasksPreviousMonth,
			overdueTasksDifference: overdueTasksLastMonth - overdueTasksPreviousMonth,
			incompleteTasksDifference:
				incompleteTasksLastMonth - incompleteTasksPreviousMonth
		}
	}

	async update(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
		const updatedProject = await this.prisma.project.update({
			where: { id },
			data: {
				name: dto.name,
				description: dto.description
			},
			select: projectSelect
		})

		return this.formatProjectResponse(updatedProject)
	}

	async delete(id: string): Promise<void> {
		await this.prisma.project.delete({
			where: { id }
		})
	}

	async generateInviteLink(
		projectId: string,
		issuerId: string
	): Promise<string> {
		const project = await this.prisma.project.findUnique({
			where: { id: projectId },
			select: { id: true }
		})

		if (!project) {
			throw new NotFoundException('Project not found')
		}

		const token = randomBytes(32).toString('base64url')
		const inviteId = randomBytes(16).toString('hex')
		await this.prisma.$executeRaw`
			INSERT INTO "ProjectInvite" (
				"id",
				"token_hash",
				"role",
				"project_id",
				"issuer_id",
				"expires_at"
			)
			VALUES (
				${inviteId},
				${this.hashInviteToken(token)},
				${ProjectRole.DEVELOPER}::"ProjectRole",
				${projectId},
				${issuerId},
				${dayjs().add(7, 'days').toDate()}
			)
		`

		const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000'
		return `${baseUrl}/main/projects/${projectId}/join/${token}`
	}

	async joinByInviteToken(token: string, userId: string): Promise<ProjectDto> {
		if (!token) {
			throw new BadRequestException('Invite token is required')
		}

		const tokenHash = this.hashInviteToken(token)
		const [invite] = await this.prisma.$queryRaw<InviteRow[]>`
			SELECT
				"id",
				"role",
				"project_id",
				"issuer_id",
				"used_by_id",
				"expires_at",
				"used_at",
				"revoked_at"
			FROM "ProjectInvite"
			WHERE "token_hash" = ${tokenHash}
			LIMIT 1
		`

		if (!invite) {
			throw new BadRequestException('Invalid invite link')
		}

		if (invite.revoked_at) {
			throw new GoneException('Invite link has been revoked')
		}

		if (invite.used_at) {
			throw new ConflictException('Invite link has already been used')
		}

		if (dayjs().isAfter(invite.expires_at)) {
			throw new GoneException('Invite link has expired')
		}

		const existingMember = await this.getMembership(invite.project_id, userId)
		if (existingMember) {
			throw new ConflictException('User is already a member of the project')
		}

		const project = await this.prisma.project.findUnique({
			where: { id: invite.project_id },
			select: projectSelect
		})

		if (!project) {
			throw new NotFoundException('Project not found')
		}

		try {
			await this.prisma.$transaction([
				this.prisma.projectUser.create({
					data: {
						userId,
						projectId: invite.project_id,
						role: invite.role
					}
				}),
				this.prisma.$executeRaw`
					UPDATE "ProjectInvite"
					SET "used_at" = ${new Date()}, "used_by_id" = ${userId}
					WHERE "id" = ${invite.id}
				`
			])
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException('User is already a member of the project')
			}
			throw error
		}

		return this.formatProjectResponse(project)
	}

	async addMember(projectId: string, userId: string): Promise<ProjectDto> {
		const user = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true }
		})
		if (!user) throw new NotFoundException('User not found')

		try {
			const project = await this.prisma.project.update({
				where: { id: projectId },
				data: {
					members: {
						create: [{ userId }]
					}
				},
				select: projectSelect
			})

			return this.formatProjectResponse(project)
		} catch (error) {
			if (
				error instanceof Prisma.PrismaClientKnownRequestError &&
				error.code === 'P2002'
			) {
				throw new ConflictException('User is already a member of the project')
			}
			throw error
		}
	}

	async removeMember(
		projectId: string,
		targetUserId: string,
		actorUserId: string
	): Promise<ProjectDto> {
		const project = await this.prisma.project.findUnique({
			where: { id: projectId },
			select: {
				ownerId: true,
				members: true
			}
		})

		if (!project) throw new NotFoundException('Project not found')
		if (targetUserId === project.ownerId) {
			throw new ForbiddenException(
				'Project owner cannot be removed from the project'
			)
		}

		const actorMembership = project.members.find(
			member => member.userId === actorUserId
		)
		const targetMembership = project.members.find(
			member => member.userId === targetUserId
		)
		if (!targetMembership)
			throw new NotFoundException('User is not a member of the project')
		if (!actorMembership)
			throw new ForbiddenException('You do not have access to this project')

		if (
			actorMembership.role === ProjectRole.MANAGER &&
			targetMembership.role !== ProjectRole.DEVELOPER
		) {
			throw new ForbiddenException('Managers can remove only developers')
		}

		const updatedProject = await this.prisma.project.update({
			where: { id: projectId },
			data: {
				members: {
					delete: {
						userId_projectId: {
							userId: targetUserId,
							projectId
						}
					}
				}
			},
			select: projectSelect
		})

		return this.formatProjectResponse(updatedProject)
	}

	async getAllMembers(projectId: string): Promise<ProjectMemberDto[]> {
		const project = await this.prisma.project.findUnique({
			where: { id: projectId },
			select: {
				members: projectSelect.members
			}
		})

		if (!project) {
			throw new NotFoundException('Project not found')
		}

		return project.members
	}

	private async assertMember(projectId: string, userId: string): Promise<void> {
		const member = await this.getMembership(projectId, userId)
		if (!member) {
			throw new ForbiddenException('You do not have access to this project')
		}
	}

	private formatProjectResponse(
		project: ProjectWithResponse,
		includeTimestamps = false
	): ProjectDto {
		if (includeTimestamps) return project

		return {
			id: project.id,
			name: project.name,
			description: project.description,
			ownerId: project.ownerId,
			owner: project.owner,
			members: project.members,
			tasks: project.tasks
		}
	}

	private hashInviteToken(token: string): string {
		return createHash('sha256').update(token).digest('hex')
	}
}
