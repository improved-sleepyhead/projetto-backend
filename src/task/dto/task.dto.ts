import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TaskPriority, TaskStatus } from '@prisma/client'
import {
	IsEnum,
	IsISO8601,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator'

export class TaskUserDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	name: string

	@ApiProperty()
	email: string
}

export class CreateTaskDto {
	@ApiProperty({ minLength: 3, example: 'Implement auth guard' })
	@IsString()
	@MinLength(3, { message: 'Title must be at least 3 characters long' })
	title: string

	@ApiPropertyOptional({ example: 'Protect project scoped endpoints' })
	@IsString()
	@IsOptional()
	description?: string

	@ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
	@IsEnum(TaskStatus)
	@IsOptional()
	status?: TaskStatus

	@ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
	@IsEnum(TaskPriority)
	@IsOptional()
	priority?: TaskPriority

	@ApiPropertyOptional({ format: 'date-time' })
	@IsISO8601()
	@IsOptional()
	dueDate?: string

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	assigneeId?: string
}

export class UpdateTaskDto {
	@ApiPropertyOptional({ minLength: 3 })
	@IsString()
	@MinLength(3, { message: 'Title must be at least 3 characters long' })
	@IsOptional()
	title?: string

	@ApiPropertyOptional()
	@IsString()
	@IsOptional()
	description?: string

	@ApiPropertyOptional({ enum: TaskStatus })
	@IsEnum(TaskStatus)
	@IsOptional()
	status?: TaskStatus

	@ApiPropertyOptional({ enum: TaskPriority })
	@IsEnum(TaskPriority)
	@IsOptional()
	priority?: TaskPriority

	@ApiPropertyOptional({ format: 'date-time', nullable: true })
	@IsISO8601()
	@IsOptional()
	dueDate?: string

	@ApiPropertyOptional({ nullable: true })
	@IsString()
	@IsOptional()
	assigneeId?: string | null
}

export class TaskProjectDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	name: string

	@ApiPropertyOptional({ nullable: true })
	description?: string | null

	@ApiProperty()
	ownerId: string
}

export class TaskDto {
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

	@ApiProperty()
	position: number

	@ApiProperty({ type: TaskProjectDto })
	project: TaskProjectDto

	@ApiPropertyOptional({ type: TaskUserDto, nullable: true })
	assignee?: TaskUserDto | null

	@ApiPropertyOptional()
	createdAt?: Date

	@ApiPropertyOptional()
	updatedAt?: Date
}
