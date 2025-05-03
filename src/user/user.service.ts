import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { hash } from 'argon2';
import { ProjectSummary, TaskSummary, UserProfileDto } from './dto/user-profile.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { userProjectsOwnedSelect, userTasksSelect } from './constants/user.constants';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';
import * as dayjs from 'dayjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        ...userTasksSelect,
        projectsOwned: userProjectsOwnedSelect.projectsOwned,
      },
    });
  }

  getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    return this.prisma.user.findMany({
      skip,
      take: limit,
      select: {
        ...userTasksSelect,
        projectsOwned: userProjectsOwnedSelect.projectsOwned,
      },
    });
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const now = dayjs();
    const oneMonthAgo = now.subtract(30, 'days').toDate();       // Последние 30 дней
    const twoMonthsAgo = now.subtract(60, 'days').toDate();      // Предыдущие 30 дней (от 60 до 30)
  
    // Получаем пользователя с проектами и задачами
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projectRoles: {
          include: {
            project: true,
          },
        },
        tasks: true,
      },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // Подсчёт задач для пользователя
    const [
      totalTasks,
      tasksLastMonth,
      tasksPreviousMonth,
  
      assignedTasks,
      assignedTasksLastMonth,
      assignedTasksPreviousMonth,
  
      completedTasks,
      completedTasksLastMonth,
      completedTasksPreviousMonth,
  
      overdueTasks,
      overdueTasksLastMonth,
      overdueTasksPreviousMonth,
    ] = await Promise.all([
      this.prisma.task.count({ where: { assigneeId: userId } }),
  
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          createdAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),
  
      this.prisma.task.count({
        where: { assigneeId: userId },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          createdAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),
  
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
          updatedAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          status: 'DONE',
          updatedAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),
  
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lte: now.toDate() },
          status: { not: 'DONE' },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lte: now.toDate(), gte: oneMonthAgo },
          status: { not: 'DONE' },
        },
      }),
      this.prisma.task.count({
        where: {
          assigneeId: userId,
          dueDate: { lte: now.toDate(), gte: twoMonthsAgo, lt: oneMonthAgo },
          status: { not: 'DONE' },
        },
      }),
    ]);
  
    return {
      totalProjects: user.projectRoles.length,
      totalTasks,
      totalTasksDifference: tasksLastMonth - tasksPreviousMonth,
      assignedTasks,
      assignedTasksDifference: assignedTasksLastMonth - assignedTasksPreviousMonth,
      completedTasks,
      completedTasksDifference: completedTasksLastMonth - completedTasksPreviousMonth,
      overdueTasks,
      overdueTasksDifference: overdueTasksLastMonth - overdueTasksPreviousMonth,
    };
  }

  async getTotalTasks(
    id: string,
    filters?: {
      projectId?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
      dueDate?: Date;
    },
  ): Promise<TaskSummary[]> {
    const taskWhere: Prisma.TaskWhereInput = {};

    if (filters?.projectId) {
      taskWhere.projectId = filters.projectId;
    }

    if (filters?.status) {
      taskWhere.status = filters.status;
    }

    if (filters?.priority) {
      taskWhere.priority = filters.priority;
    }

    if (filters?.search) {
      taskWhere.OR = [
        { title: { contains: filters.search, mode: 'insensitive' as const } },
        { description: { contains: filters.search, mode: 'insensitive' as const } },
      ];
    }

    if (filters?.dueDate && !isNaN(filters.dueDate.getTime())) {
      taskWhere.dueDate = { equals: new Date(filters.dueDate) };
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tasks: {
          where: taskWhere,
          include: {
            project: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      project: {
        id: task.project?.id!,
        name: task.project?.name!,
        description: task.project?.description ?? null,
        ownerId: task.project?.ownerId!,
      },
      projectName: task.project?.name || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
    }));
  }

  async getProjects(id: string): Promise<ProjectSummary[]> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        projectRoles: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.projectRoles.map((projectRole) => ({
      id: projectRole.project.id,
      name: projectRole.project.name,
    }));
  }

  async getOwnedProjects(id: string): Promise<ProjectSummary[]> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        projectsOwned: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.projectsOwned.map((project) => ({
      id: project.id,
      name: project.name,
    }));
  }

  async create(dto: CreateUserDto) {
    const hashedPassword = await hash(dto.password);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    let data = dto;

    if (dto.password) {
      data = { ...dto, password: await hash(dto.password) };
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }
}