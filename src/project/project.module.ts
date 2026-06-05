import { Module } from '@nestjs/common'
import { ProjectService } from './project.service'
import { ProjectController } from './project.controller'
import { AuthModule } from 'src/auth/auth.module'

@Module({
	imports: [AuthModule],
	controllers: [ProjectController],
	providers: [ProjectService],
	exports: [ProjectService]
})
export class ProjectModule {}
