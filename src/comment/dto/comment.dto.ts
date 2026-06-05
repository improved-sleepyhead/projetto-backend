import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MinLength } from 'class-validator'

export class CommentUserDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	name: string

	@ApiProperty()
	email: string
}

export class CreateCommentDto {
	@ApiProperty({ minLength: 1, example: 'Looks good' })
	@IsString()
	@MinLength(1, { message: 'Content must not be empty' })
	content: string
}

export class UpdateCommentDto {
	@ApiPropertyOptional({ minLength: 1 })
	@IsString()
	@MinLength(1, { message: 'Content must not be empty' })
	@IsOptional()
	content?: string
}

export class CommentDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	content: string

	@ApiProperty()
	authorId: string

	@ApiProperty()
	taskId: string

	@ApiProperty()
	createdAt: Date

	@ApiProperty({ type: CommentUserDto })
	author: CommentUserDto
}
