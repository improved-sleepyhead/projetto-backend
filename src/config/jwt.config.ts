import { ConfigService } from '@nestjs/config'
import { JwtModuleOptions } from '@nestjs/jwt'

export const getJwtConfig = (
	configService: ConfigService
): JwtModuleOptions => ({
	secret: configService.get('JWT_SECRET'),
	signOptions: { expiresIn: '7d' }
})
