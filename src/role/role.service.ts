import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { ProjectRole } from '@prisma/client'

import { PrismaService } from '../prisma.service'
import { UpdateRoleDto } from './dto/role.dto'

@Injectable()
export class RoleService {
	constructor(private prisma: PrismaService) {}

	async updateRole(
		projectId: string,
		userId: string,
		actorUserId: string,
		dto: UpdateRoleDto
	): Promise<void> {
		if (actorUserId === userId) {
			throw new ForbiddenException('Users cannot change their own project role')
		}

		const project = await this.prisma.project.findUnique({
			where: { id: projectId },
			select: {
				ownerId: true,
				members: true
			}
		})

		if (!project) {
			throw new NotFoundException('Project not found')
		}

		if (userId === project.ownerId) {
			throw new ForbiddenException('Project owner role cannot be changed')
		}

		const actorMembership = project.members.find(
			member => member.userId === actorUserId
		)
		const targetMembership = project.members.find(
			member => member.userId === userId
		)

		if (!actorMembership) {
			throw new ForbiddenException('You do not have access to this project')
		}

		if (!targetMembership) {
			throw new NotFoundException('User is not a member of the project')
		}

		if (actorMembership.role !== ProjectRole.PROJECT_ADMIN) {
			throw new ForbiddenException(
				'Only project admins can update project roles'
			)
		}

		const actorIsOwner = actorUserId === project.ownerId
		const touchesAdmin =
			targetMembership.role === ProjectRole.PROJECT_ADMIN ||
			dto.role === ProjectRole.PROJECT_ADMIN

		if (touchesAdmin && !actorIsOwner) {
			throw new ForbiddenException(
				'Only project owners can grant or change project admin roles'
			)
		}

		await this.prisma.projectUser.update({
			where: {
				userId_projectId: { userId, projectId }
			},
			data: {
				role: dto.role
			}
		})
	}
}
