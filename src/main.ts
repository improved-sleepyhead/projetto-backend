import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'
import helmet from 'helmet'

import { AppModule } from './app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.setGlobalPrefix('api')
	app.use(helmet())
	app.use(cookieParser())
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	)

	app.enableCors({
		origin: ['http://localhost:3000'],
		credentials: true,
		exposedHeaders: ['set-cookie']
	})

	const config = new DocumentBuilder()
		.setTitle('Projetto API')
		.setDescription('Backend API for a Jira-like project and task tracker')
		.setVersion('1.0')
		.addBearerAuth()
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document)

	const port = Number(process.env.PORT ?? 4200)
	await app.listen(port)
}

void bootstrap()
