import { IsString, IsEmail, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum Role {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  USER = 'USER',
}

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  name: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsEnum(Role, { message: 'Role must be one of: ADMIN, DEVELOPER, USER' })
  @IsOptional()
  role?: Role;
}

export class UpdateUserDto {
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsOptional()
  password?: string;

  @IsEnum(Role, { message: 'Role must be one of: ADMIN, DEVELOPER, USER' })
  @IsOptional()
  role?: Role;
}