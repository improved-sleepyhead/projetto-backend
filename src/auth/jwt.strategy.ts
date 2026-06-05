import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserService } from 'src/user/user.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private userService: UserService
	) {
		const secret = configService.get<string>('JWT_SECRET')
		if (!secret) {
			throw new Error('JWT_SECRET is not defined')
		}

		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: secret
		})
	}

	async validate({ id }: { id: string }) {
		return this.userService.getPublicById(id)
	}
}
