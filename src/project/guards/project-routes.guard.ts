import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ProjectRole } from '@prisma/client'

import { CurrentUserContext } from 'src/user/user.service'

import { ROLES_KEY } from '../decorators/roles.decorator'
import { ProjectService } from '../project.service'

interface ProjectRequest {
	params: {
		id?: string
		projectId?: string
	}
	user?: CurrentUserContext
}

@Injectable()
export class ProjectRolesGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly projectService: ProjectService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles =
			this.reflector.getAllAndOverride<ProjectRole[]>(ROLES_KEY, [
				context.getHandler(),
				context.getClass()
			]) ?? []

		const request = context.switchToHttp().getRequest<ProjectRequest>()
		const projectId = request.params.projectId ?? request.params.id
		const currentUserId = request.user?.id

		if (!projectId) return true
		if (!currentUserId) {
			throw new ForbiddenException('Invalid authenticated request')
		}

		const membership = await this.projectService.getMembership(
			projectId,
			currentUserId
		)
		if (!membership) {
			throw new ForbiddenException('You do not have access to this project')
		}

		if (requiredRoles.length > 0 && !requiredRoles.includes(membership.role)) {
			throw new ForbiddenException(
				'You do not have permission to perform this action'
			)
		}

		return true
	}
}
