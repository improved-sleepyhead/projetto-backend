import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTaskDto, TaskDto, UpdateTaskDto } from './dto/task.dto';
import { TaskStatus, TaskPriority } from '@prisma/client';
import { taskInclude } from './constants/task.constans';

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

  async getAllByProject(projectId: string, timestamps = false): Promise<TaskDto[]> {
    const tasks = await this.prisma.task.findMany({
      where: { projectId },
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