import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { commentSelect } from './constants/comment.constants';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto, authorId: string, taskId: string): Promise<CommentDto> {
    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        author: {
          connect: { id: authorId },
        },
        task: {
          connect: { id: taskId },
        },
      },
      select: commentSelect,
    });
  
    return comment;
  }

  async getById(id: string): Promise<CommentDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: commentSelect,
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async getAllByTask(taskId: string): Promise<CommentDto[]> {
    return this.prisma.comment.findMany({
      where: { taskId },
      select: commentSelect,
    });
  }

  async update(id: string, dto: UpdateCommentDto): Promise<CommentDto> {
    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
      select: commentSelect,
    });

    return updatedComment;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }
}