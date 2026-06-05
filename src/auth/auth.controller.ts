import {
	Body,
	Controller,
	HttpCode,
	Post,
	Req,
	Res,
	UnauthorizedException
} from '@nestjs/common'
import { ApiOkResponse, ApiTags } from '@nestjs/swagger'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service'
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto'

interface CookieRequest {
	cookies?: Record<string, string | undefined>
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@ApiOkResponse({ type: AuthResponseDto })
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response
	): Promise<AuthResponseDto> {
		const { refreshToken, ...response } = await this.authService.login(dto)
		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

	@ApiOkResponse({ type: AuthResponseDto })
	@HttpCode(200)
	@Post('register')
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response
	): Promise<AuthResponseDto> {
		const { refreshToken, ...response } = await this.authService.register(dto)

		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

	@ApiOkResponse({ type: AuthResponseDto })
	@HttpCode(200)
	@Post('login/access-token')
	async getNewTokens(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
	): Promise<AuthResponseDto> {
		const cookieRequest = req as unknown as CookieRequest
		const refreshTokenFromCookies =
			cookieRequest.cookies?.[this.authService.REFRESH_TOKEN_NAME]

		if (typeof refreshTokenFromCookies !== 'string') {
			this.authService.removeRefreshTokenFromResponse(res)
			throw new UnauthorizedException('Refresh token not found')
		}

		const { refreshToken, ...response } = await this.authService.getNewTokens(
			refreshTokenFromCookies
		)

		this.authService.addRefreshTokenToResponse(res, refreshToken)

		return response
	}

	@ApiOkResponse({ type: Boolean })
	@HttpCode(200)
	@Post('logout')
	logout(@Res({ passthrough: true }) res: Response): boolean {
		this.authService.removeRefreshTokenFromResponse(res)
		return true
	}
}
