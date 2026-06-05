import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post
} from '@nestjs/common'
import {
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNoContentResponse,
	ApiOkResponse,
	ApiTags
} from '@nestjs/swagger'

import { CurrentUser } from 'src/auth/decorators/user.decorator'
import { Auth } from '../auth/decorators/auth.decorator'
import { CommentService } from './comment.service'
import {
	CommentDto,
	CreateCommentDto,
	UpdateCommentDto
} from './dto/comment.dto'

@ApiTags('comments')
@ApiBearerAuth()
@Controller('tasks/:taskId/comments')
export class CommentController {
	constructor(private readonly commentService: CommentService) {}

	@ApiCreatedResponse({ type: CommentDto })
	@Post()
	@Auth()
	async create(
		@Param('taskId') taskId: string,
		@Body() dto: CreateCommentDto,
		@CurrentUser('id') authorId: string
	): Promise<CommentDto> {
		return this.commentService.create(dto, authorId, taskId)
	}

	@ApiOkResponse({ type: [CommentDto] })
	@Get()
	@Auth()
	async getAllByTask(
		@Param('taskId') taskId: string,
		@CurrentUser('id') userId: string
	): Promise<CommentDto[]> {
		return this.commentService.getAllByTask(taskId, userId)
	}

	@ApiOkResponse({ type: CommentDto })
	@Get(':commentId')
	@Auth()
	async getById(
		@Param('commentId') commentId: string,
		@CurrentUser('id') userId: string
	): Promise<CommentDto> {
		return this.commentService.getById(commentId, userId)
	}

	@ApiOkResponse({ type: CommentDto })
	@Patch(':commentId')
	@Auth()
	async update(
		@Param('commentId') commentId: string,
		@Body() dto: UpdateCommentDto,
		@CurrentUser('id') userId: string
	): Promise<CommentDto> {
		return this.commentService.update(commentId, dto, userId)
	}

	@ApiNoContentResponse()
	@Delete(':commentId')
	@HttpCode(204)
	@Auth()
	async delete(
		@Param('commentId') commentId: string,
		@CurrentUser('id') userId: string
	): Promise<void> {
		return this.commentService.delete(commentId, userId)
	}
}
