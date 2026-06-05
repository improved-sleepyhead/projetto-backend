import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { GlobalRole } from '@prisma/client'
import {
	IsEmail,
	IsEnum,
	IsOptional,
	IsString,
	MinLength
} from 'class-validator'

export class UserDto {
	@ApiProperty()
	id: string

	@ApiProperty({ example: 'Jane Doe' })
	name: string

	@ApiProperty({ example: 'jane@example.com' })
	email: string

	@ApiProperty({ enum: GlobalRole })
	role: GlobalRole
}

export class CreateUserDto {
	@ApiProperty({ minLength: 3, example: 'Jane Doe' })
	@IsString()
	@MinLength(3, { message: 'Name must be at least 3 characters long' })
	name: string

	@ApiProperty({ example: 'jane@example.com' })
	@IsEmail({}, { message: 'Invalid email format' })
	email: string

	@ApiProperty({ minLength: 8, example: 'password123' })
	@IsString()
	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	password: string

	@ApiPropertyOptional({ enum: GlobalRole, default: GlobalRole.USER })
	@IsEnum(GlobalRole, { message: 'Role must be one of: ADMIN, USER' })
	@IsOptional()
	role?: GlobalRole
}

export class UpdateUserDto {
	@ApiPropertyOptional({ minLength: 3, example: 'Jane Doe' })
	@IsString()
	@MinLength(3, { message: 'Name must be at least 3 characters long' })
	@IsOptional()
	name?: string

	@ApiPropertyOptional({ example: 'jane@example.com' })
	@IsEmail({}, { message: 'Invalid email format' })
	@IsOptional()
	email?: string

	@ApiPropertyOptional({ minLength: 8, example: 'newpassword123' })
	@IsString()
	@MinLength(8, { message: 'Password must be at least 8 characters long' })
	@IsOptional()
	password?: string
}

export class UpdateUserRoleDto {
	@ApiProperty({ enum: GlobalRole })
	@IsEnum(GlobalRole, { message: 'Role must be one of: ADMIN, USER' })
	role: GlobalRole
}
