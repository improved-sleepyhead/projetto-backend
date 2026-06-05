import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ProjectRole } from '@prisma/client'

import { PrismaService } from '../prisma.service'
import { ProjectService } from '../project/project.service'
import { commentSelect } from './constants/comment.constants'
import {
	CommentDto,
	CreateCommentDto,
	UpdateCommentDto
} from './dto/comment.dto'

@Injectable()
export class CommentService {
	constructor(
		private prisma: PrismaService,
		private projectService: ProjectService
	) {}

	async create(
		dto: CreateCommentDto,
		authorId: string,
		taskId: string
	): Promise<CommentDto> {
		await this.assertCanReadTask(taskId, authorId)

		return this.prisma.comment.create({
			data: {
				content: dto.content,
				author: {
					connect: { id: authorId }
				},
				task: {
					connect: { id: taskId }
				}
			},
			select: commentSelect
		})
	}

	async getById(id: string, userId: string): Promise<CommentDto> {
		const comment = await this.prisma.comment.findUnique({
			where: { id },
			select: {
				...commentSelect,
				task: { select: { projectId: true } }
			}
		})

		if (!comment) {
			throw new NotFoundException('Comment not found')
		}

		await this.assertProjectMember(comment.task.projectId, userId)
		return {
			id: comment.id,
			content: comment.content,
			authorId: comment.authorId,
			taskId: comment.taskId,
			createdAt: comment.createdAt,
			author: comment.author
		}
	}

	async getAllByTask(taskId: string, userId: string): Promise<CommentDto[]> {
		await this.assertCanReadTask(taskId, userId)

		return this.prisma.comment.findMany({
			where: { taskId },
			select: commentSelect,
			orderBy: { createdAt: 'asc' }
		})
	}

	async update(
		id: string,
		dto: UpdateCommentDto,
		userId: string
	): Promise<CommentDto> {
		const comment = await this.getCommentForMutation(id)
		await this.assertCanMutateComment(
			comment.task.projectId,
			comment.authorId,
			userId
		)

		return this.prisma.comment.update({
			where: { id },
			data: {
				content: dto.content
			},
			select: commentSelect
		})
	}

	async delete(id: string, userId: string): Promise<void> {
		const comment = await this.getCommentForMutation(id)
		await this.assertCanMutateComment(
			comment.task.projectId,
			comment.authorId,
			userId
		)

		await this.prisma.comment.delete({
			where: { id }
		})
	}

	private async getCommentForMutation(id: string) {
		const comment = await this.prisma.comment.findUnique({
			where: { id },
			select: {
				id: true,
				authorId: true,
				task: { select: { projectId: true } }
			}
		})

		if (!comment) {
			throw new NotFoundException('Comment not found')
		}

		return comment
	}

	private async assertCanReadTask(
		taskId: string,
		userId: string
	): Promise<void> {
		const task = await this.prisma.task.findUnique({
			where: { id: taskId },
			select: { projectId: true }
		})

		if (!task) {
			throw new NotFoundException('Task not found')
		}

		await this.assertProjectMember(task.projectId, userId)
	}

	private async assertProjectMember(
		projectId: string,
		userId: string
	): Promise<ProjectRole> {
		const membership = await this.projectService.getMembership(
			projectId,
			userId
		)
		if (!membership) {
			throw new ForbiddenException('You do not have access to this project')
		}

		return membership.role
	}

	private async assertCanMutateComment(
		projectId: string,
		authorId: string,
		userId: string
	): Promise<void> {
		const role = await this.assertProjectMember(projectId, userId)
		if (
			authorId === userId ||
			role === ProjectRole.PROJECT_ADMIN ||
			role === ProjectRole.MANAGER
		) {
			return
		}

		throw new ForbiddenException(
			'You do not have permission to modify this comment'
		)
	}
}
