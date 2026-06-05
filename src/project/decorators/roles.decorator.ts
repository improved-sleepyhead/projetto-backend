import { SetMetadata } from '@nestjs/common'
import { GlobalRole, ProjectRole } from '@prisma/client'

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Array<GlobalRole | ProjectRole>) =>
	SetMetadata(ROLES_KEY, roles)
