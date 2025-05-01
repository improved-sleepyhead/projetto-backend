import { Controller, Post, Body, Get, Param, Patch, Delete, HttpCode, UsePipes, ValidationPipe, Query} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { TaskService } from './task.service';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto/task.dto';
import { UpdateTaskOrderDto } from './dto/bulk-update.dto';

@Controller('projects/:projectId/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @Auth()
  @UsePipes(new ValidationPipe())
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<TaskDto> {
    return this.taskService.create({ ...dto, projectId });
  }

  @Get()
  @Auth()
  async getAllByProject(
    @Param('projectId') projectId: string,
    @Query('timestamps') timestamps: boolean,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('assigneeId') assigneeId?: string,
    @Query('search') search?: string,
    @Query('dueDate') dueDate?: Date,
  ): Promise<TaskDto[]> {
    return this.taskService.getAllByProject(projectId, {
      status,
      priority,
      assigneeId,
      search,
      dueDate,
    }, timestamps);
  }

  @Get(':taskId')
  @Auth()
  async getById(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Query('timestamps') timestamps: boolean,
  ): Promise<TaskDto> {
    return this.taskService.getById(taskId, timestamps);
  }

  @Patch('order')
  @Auth()
  @UsePipes(new ValidationPipe())
  async updateOrder(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateTaskOrderDto,
  ): Promise<void> {
    return this.taskService.updateOrder(projectId, dto);
  }

  @Patch(':taskId')
  @Auth()
  @UsePipes(new ValidationPipe())
  async update(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    return this.taskService.update(taskId, dto);
  }


  @Delete(':taskId')
  @HttpCode(204)
  @Auth()
  async delete(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
  ): Promise<void> {
    return this.taskService.delete(taskId);
  }
}