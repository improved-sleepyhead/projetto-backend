import { TaskPriority, TaskStatus, User } from "@prisma/client";
import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';

export class UserDto {
  id: string;
  name: string;
  email: string;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus, { message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority, { message: 'Priority must be one of: LOW, MEDIUM, HIGH' })
  @IsOptional()
  priority?: TaskPriority;

  @IsOptional()
  dueDate?: Date;

  @IsString()
  projectId: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;
}

export class UpdateTaskDto {
    @IsString()
    @MinLength(3, { message: 'Title must be at least 3 characters long' })
    @IsOptional()
    title?: string;
  
    @IsString()
    @IsOptional()
    description?: string;
  
    @IsEnum(TaskStatus, { message: 'Status must be one of: TODO, IN_PROGRESS, DONE' })
    @IsOptional()
    status?: TaskStatus;
  
    @IsEnum(TaskPriority, { message: 'Priority must be one of: LOW, MEDIUM, HIGH' })
    @IsOptional()
    priority?: TaskPriority;
  
    @IsOptional()
    dueDate?: Date;
  
    @IsString()
    @IsOptional()
    assigneeId?: string;
}

export class TaskDto {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  projectId: string;
  assignee?: UserDto;
  comments?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}