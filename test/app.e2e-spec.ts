import {
	ArgumentMetadata,
	INestApplication,
	NotFoundException,
	ValidationPipe
} from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import type { Response } from 'express'

import { AppModule } from '../src/app.module'
import { AuthController } from '../src/auth/auth.controller'
import { LoginDto } from '../src/auth/dto/auth.dto'
import { PrismaService } from '../src/prisma.service'

describe('App API validation (e2e)', () => {
	let app: INestApplication
	let authController: AuthController
	const validationPipe = new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true
	})

	beforeAll(async () => {
		process.env.JWT_SECRET = 'test-secret'

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule]
		})
			.overrideProvider(PrismaService)
			.useValue({
				$connect: jest.fn(),
				user: {
					findUnique: jest.fn().mockResolvedValue(null)
				}
			})
			.compile()

		app = moduleFixture.createNestApplication()
		await app.init()
		authController = app.get(AuthController)
	})

	afterAll(async () => {
		await app.close()
	})

	it('accepts login payload without name and reaches auth service validation', async () => {
		const metadata: ArgumentMetadata = {
			type: 'body',
			metatype: LoginDto,
			data: undefined
		}
		const dto = (await validationPipe.transform(
			{ email: 'missing@example.com', password: 'password123' },
			metadata
		)) as LoginDto
		const response = {
			cookie: jest.fn()
		} as unknown as Response

		await expect(authController.login(dto, response)).rejects.toBeInstanceOf(
			NotFoundException
		)
	})
})
