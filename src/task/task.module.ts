import { Module } from '@nestjs/common'
import { TaskService } from './task.service'
import { TaskController } from './task.controller'
import { ProjectModule } from 'src/project/project.module'

@Module({
	imports: [ProjectModule],
	controllers: [TaskController],
	providers: [TaskService],
	exports: [TaskService]
})
export class TaskModule {}
