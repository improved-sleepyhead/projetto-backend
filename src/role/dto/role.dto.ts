import { ApiProperty } from '@nestjs/swagger'
import { ProjectRole } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateRoleDto {
	@ApiProperty({ enum: ProjectRole })
	@IsEnum(ProjectRole)
	role: ProjectRole
}
