import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import type { Response } from 'express'

import { PublicUser, UserService } from 'src/user/user.service'

import { LoginDto, RegisterDto } from './dto/auth.dto'

interface AuthResult {
	user: PublicUser
	accessToken: string
	refreshToken: string
}

@Injectable()
export class AuthService {
	readonly EXPIRE_DAY_REFRESH_TOKEN = 1
	readonly REFRESH_TOKEN_NAME = 'refreshToken'

	constructor(
		private jwt: JwtService,
		private userService: UserService
	) {}

	async login(dto: LoginDto): Promise<AuthResult> {
		const user = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async register(dto: RegisterDto): Promise<AuthResult> {
		const oldUser = await this.userService.getByEmail(dto.email)

		if (oldUser) throw new BadRequestException('User already exists')

		const user = await this.userService.createPublicUser(dto)
		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async getNewTokens(refreshToken: string): Promise<AuthResult> {
		const result = await this.jwt.verifyAsync<{ id?: string }>(refreshToken)
		if (!result?.id) {
			throw new UnauthorizedException('Invalid refresh token')
		}

		const user = await this.userService.getPublicById(result.id)
		if (!user) {
			throw new NotFoundException('User not found')
		}

		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	addRefreshTokenToResponse(res: Response, refreshToken: string): void {
		const expiresIn = new Date()
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

		res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
			httpOnly: true,
			expires: expiresIn,
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
		})
	}

	removeRefreshTokenFromResponse(res: Response): void {
		res.cookie(this.REFRESH_TOKEN_NAME, '', {
			httpOnly: true,
			expires: new Date(0),
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
		})
	}

	private issueTokens(userId: string): {
		accessToken: string
		refreshToken: string
	} {
		const data = { id: userId }
		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private async validateUser(dto: LoginDto): Promise<PublicUser> {
		const user = await this.userService.getByEmailWithPassword(dto.email)

		if (!user) throw new NotFoundException('User not found')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Invalid password')

		return this.userService.toPublicUser(user)
	}
}
