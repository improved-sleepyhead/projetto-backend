import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto/task.dto';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { taskInclude } from './constants/task.constans';
import { UpdateTaskOrderDto } from './dto/bulk-update.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    const { projectId, assigneeId, ...rest } = dto;

    const task = await this.prisma.task.create({
    data: {
      ...rest,
      status: rest.status || TaskStatus.TODO,
      priority: rest.priority || TaskPriority.MEDIUM,
      project: { connect: { id: projectId } },
      assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
    },
      include: taskInclude,
    });
  
    return this.formatTaskResponse(task);
  }

  async getById(id: string, timestamps = false): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.formatTaskResponse(task, timestamps);
  }

  async getAllByProject(
    projectId: string,
    filters: {
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string;
      search?: string;
      dueDate?: Date;
    },
    timestamps = false,
  ): Promise<TaskDto[]> {
    const { status, priority, assigneeId, search, dueDate } = filters;
  
    const where = {
      projectId,
      status: status || undefined,
      priority: priority || undefined,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? { equals: new Date(dueDate) } : undefined,
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ]
        : undefined,
    };
  
    const tasks = await this.prisma.task.findMany({
      where,
      include: taskInclude,
    });
  
    return tasks.map((task) => this.formatTaskResponse(task, timestamps));
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const { assigneeId, ...rest } = dto;

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
      ...rest,
      assignee: assigneeId
        ? { connect: { id: assigneeId } }
        : { disconnect: true },
    },
      include: taskInclude,
    });

    return this.formatTaskResponse(updatedTask);
  }

  async updateOrder(
    projectId: string,
    dto: UpdateTaskOrderDto,
  ): Promise<void> {
    const { tasks } = dto;
    
    try {
      await this.prisma.$transaction(
        tasks.map(task =>
          this.prisma.task.update({
            where: {
              id: task.id,
              projectId: projectId,
            },
            data: {
              status: task.status,
              position: task.position,
            },
          })
        )
      );
    } catch (error) {
      console.error('Failed to update task order:', error);
      throw new Error('Failed to update task order');
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  private formatTaskResponse(task: any, timestamps = false): TaskDto {
    const { createdAt, updatedAt, ...rest } = task;

    if (timestamps) {
      return {
        ...rest,
        createdAt,
        updatedAt,
      };
    }

    return rest;
  }
}