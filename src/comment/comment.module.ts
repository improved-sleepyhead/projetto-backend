import { Module } from '@nestjs/common'
import { CommentService } from './comment.service'
import { CommentController } from './comment.controller'
import { ProjectModule } from 'src/project/project.module'

@Module({
	imports: [ProjectModule],
	controllers: [CommentController],
	providers: [CommentService],
	exports: [CommentService]
})
export class CommentModule {}
