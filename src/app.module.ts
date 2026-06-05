import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ConfigModule } from '@nestjs/config'
import { ProjectModule } from './project/project.module'
import { CommentModule } from './comment/comment.module'
import { TaskModule } from './task/task.module'
import { RoleModule } from './role/role.module'
import { PrismaModule } from './prisma.module'

@Module({
	imports: [
		ConfigModule.forRoot(),
		ThrottlerModule.forRoot([
			{
				ttl: 60000,
				limit: 100
			}
		]),
		PrismaModule,
		AuthModule,
		UserModule,
		ProjectModule,
		CommentModule,
		TaskModule,
		RoleModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard
		}
	]
})
export class AppModule {}
