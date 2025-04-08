import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CommentDto, CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

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
      include: {
        author: true,
      },
    });

    return comment;
  }

  async getById(id: string): Promise<CommentDto> {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async getAllByTask(taskId: string): Promise<CommentDto[]> {
    return this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: true,
      },
    });
  }

  async update(id: string, dto: UpdateCommentDto): Promise<CommentDto> {
    const updatedComment = await this.prisma.comment.update({
      where: { id },
      data: {
        content: dto.content,
      },
      include: {
        author: true,
      },
    });

    return updatedComment;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.comment.delete({
      where: { id },
    });
  }
}