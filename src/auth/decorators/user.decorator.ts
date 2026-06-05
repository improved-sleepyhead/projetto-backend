import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import type { CurrentUserContext } from 'src/user/user.service'

interface AuthenticatedRequest {
	user?: CurrentUserContext
}

export const CurrentUser = createParamDecorator(
	(data: keyof CurrentUserContext | undefined, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
		const user = request.user

		return data && user ? user[data] : user
	}
)
