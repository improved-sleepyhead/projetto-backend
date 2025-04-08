import { IsOptional, IsString, MinLength } from 'class-validator';
import { User } from '@prisma/client';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Content must not be empty' })
  content: string;
}

export class UpdateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Content must not be empty' })
  @IsOptional()
  content?: string;
}

export class CommentDto {
  id: string;
  content: string;
  author: User;
  taskId: string;
  createdAt: Date;
}