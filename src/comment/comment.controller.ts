import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { CommentService } from './comment.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('tasks/:taskId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @Auth()
  @UsePipes(new ValidationPipe())
  async create(
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') authorId: string,
  ): Promise<CommentDto> {
    return this.commentService.create(dto, authorId, taskId);
  }

  @Get()
  @Auth()
  async getAllByTask(@Param('taskId') taskId: string): Promise<CommentDto[]> {
    return this.commentService.getAllByTask(taskId);
  }

  @Get(':commentId')
  @Auth()
  async getById(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ): Promise<CommentDto> {
    return this.commentService.getById(commentId);
  }

  @Patch(':commentId')
  @Auth()
  @UsePipes(new ValidationPipe())
  async update(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentDto> {
    return this.commentService.update(commentId, dto);
  }

  @Delete(':commentId')
  @HttpCode(204)
  @Auth()
  async delete(
    @Param('taskId') taskId: string,
    @Param('commentId') commentId: string,
  ): Promise<void> {
    return this.commentService.delete(commentId);
  }
}