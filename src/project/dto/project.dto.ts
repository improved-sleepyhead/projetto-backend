import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProjectRole, TaskPriority, TaskStatus } from '@prisma/client'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class ProjectUserDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	name: string

	@ApiProperty()
	email: string
}

export class ProjectMemberDto {
	@ApiProperty()
	userId: string

	@ApiProperty()
	projectId: string

	@ApiProperty({ enum: ProjectRole })
	role: ProjectRole

	@ApiProperty({ type: ProjectUserDto })
	user: ProjectUserDto
}

export class ProjectTaskDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	title: string

	@ApiPropertyOptional({ nullable: true })
	description?: string | null

	@ApiProperty({ enum: TaskStatus })
	status: TaskStatus

	@ApiProperty({ enum: TaskPriority })
	priority: TaskPriority

	@ApiPropertyOptional({ nullable: true })
	dueDate?: Date | null

	@ApiProperty()
	projectId: string

	@ApiPropertyOptional({ nullable: true })
	assigneeId?: string | null
}

export class CreateProjectDto {
	@ApiProperty({ minLength: 3, example: 'Backend' })
	@IsString()
	@MinLength(3, { message: 'Name must be at least 3 characters long' })
	name: string

	@ApiPropertyOptional({ example: 'Backend project board' })
	@IsString()
	@IsOptional()
	description?: string
}

export class UpdateProjectDto {
	@ApiPropertyOptional({ minLength: 3 })
	@IsString()
	@MinLength(3, { message: 'Name must be at least 3 characters long' })
	@IsOptional()
	name?: string

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	description?: string
}

export class ProjectDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	name: string

	@ApiPropertyOptional({ nullable: true })
	description?: string | null

	@ApiProperty()
	ownerId: string

	@ApiProperty({ type: ProjectUserDto })
	owner: ProjectUserDto

	@ApiProperty({ type: [ProjectMemberDto] })
	members: ProjectMemberDto[]

	@ApiProperty({ type: [ProjectTaskDto] })
	tasks: ProjectTaskDto[]

	@ApiPropertyOptional()
	createdAt?: Date

	@ApiPropertyOptional()
	updatedAt?: Date
}

export class InviteLinkDto {
	@ApiProperty()
	inviteLink: string
}

export class AcceptInviteDto {
	@ApiProperty()
	@IsString()
	token: string
}

export class ProjectStatisticsDto {
	@ApiProperty()
	totalTasks: number

	@ApiProperty()
	assignedTasks: number

	@ApiProperty()
	completedTasks: number

	@ApiProperty()
	overdueTasks: number

	@ApiProperty()
	incompleteTasks: number

	@ApiProperty()
	totalTasksDifference: number

	@ApiProperty()
	assignedTasksDifference: number

	@ApiProperty()
	completedTasksDifference: number

	@ApiProperty()
	incompleteTasksDifference: number

	@ApiProperty()
	overdueTasksDifference: number
}
