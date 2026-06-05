import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class LoginDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email: string

	@ApiProperty({ minLength: 8, example: 'password123' })
	@MinLength(8, {
		message: 'Password must be at least 8 characters long'
	})
	@IsString()
	password: string
}

export class RegisterDto extends LoginDto {
	@ApiProperty({ minLength: 3, example: 'Jane Doe' })
	@IsString()
	@MinLength(3, { message: 'Name must be at least 3 characters long' })
	name: string
}

export class AuthUserDto {
	@ApiProperty()
	id: string

	@ApiProperty()
	email: string

	@ApiProperty()
	name: string

	@ApiProperty({ enum: ['ADMIN', 'USER'] })
	role: 'ADMIN' | 'USER'
}

export class AuthResponseDto {
	@ApiProperty({ type: AuthUserDto })
	user: AuthUserDto

	@ApiProperty()
	accessToken: string
}
