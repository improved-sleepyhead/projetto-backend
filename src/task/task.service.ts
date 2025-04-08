import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto/task.dto';
import { TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTaskDto): Promise<TaskDto> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status || TaskStatus.TODO,
        priority: dto.priority || TaskPriority.MEDIUM,
        dueDate: dto.dueDate,
        project: {
          connect: { id: dto.projectId },
        },
        assignee: dto.assigneeId
          ? {
              connect: { id: dto.assigneeId }, // Связываем задачу с назначенным пользователем
            }
          : undefined,
      },
      include: {
        project: true,
        assignee: true,
        comments: true,
      },
    });
  
    return this.formatTaskResponse(task);
  }

  async getById(id: string, timestamps = false): Promise<TaskDto> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignee: true,
        comments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.formatTaskResponse(task, timestamps);
  }

  async getAllByProject(projectId: string, timestamps = false): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
      include: {
        project: true,
        assignee: true,
        comments: true,
      },
    });

    return tasks.map((task) => this.formatTaskResponse(task, timestamps));
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDto> {
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate,
        assignee: dto.assigneeId ? { connect: { id: dto.assigneeId } } : { disconnect: true },
      },
      include: {
        project: true,
        assignee: true,
        comments: true,
      },
    });

    return this.formatTaskResponse(updatedTask);
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