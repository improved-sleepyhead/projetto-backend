import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { GlobalRole } from '@prisma/client'

import { ROLES_KEY } from 'src/project/decorators/roles.decorator'

import type { CurrentUserContext } from '../user.service'

interface UserRequest {
	user?: CurrentUserContext
}

@Injectable()
export class GlobalRolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles =
			this.reflector.getAllAndOverride<GlobalRole[]>(ROLES_KEY, [
				context.getHandler(),
				context.getClass()
			]) ?? []

		if (requiredRoles.length === 0) {
			return true
		}

		const request = context.switchToHttp().getRequest<UserRequest>()
		const user = request.user

		if (!user?.role) {
			throw new ForbiddenException(
				'User is not authenticated or role is missing'
			)
		}

		if (!requiredRoles.includes(user.role)) {
			throw new ForbiddenException(
				'You do not have permission to perform this action'
			)
		}

		return true
	}
}
