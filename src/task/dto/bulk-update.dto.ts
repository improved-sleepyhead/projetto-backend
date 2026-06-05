import { ApiProperty } from '@nestjs/swagger'
import {
	IsString,
	IsNumber,
	IsEnum,
	ValidateNested,
	IsArray,
	Min
} from 'class-validator'
import { TaskStatus } from '@prisma/client'
import { Type } from 'class-transformer'

export class UpdateTaskOrderItemDto {
	@ApiProperty()
	@IsString()
	id: string

	@ApiProperty({ enum: TaskStatus })
	@IsEnum(TaskStatus)
	status: TaskStatus

	@ApiProperty({ minimum: 0 })
	@IsNumber()
	@Min(0)
	position: number
}

export class UpdateTaskOrderDto {
	@ApiProperty({ type: [UpdateTaskOrderItemDto] })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => UpdateTaskOrderItemDto)
	tasks: UpdateTaskOrderItemDto[]
}
