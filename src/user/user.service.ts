import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { hash } from 'argon2';
import { ProjectSummary, TaskSummary, UserProfileDto } from './dto/user-profile.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { userProjectsOwnedSelect, userTasksSelect } from './constants/user.constants';
import { Prisma, TaskPriority, TaskStatus } from '@prisma/client';

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

  async getProfile(id: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            project: true,
          },
        },
        projectRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const totalProjects = user.projectRoles.length;
    const assignedTasksCount = user.tasks.length;
    const completedTasksCount = user.tasks.filter((task) => task.status === 'DONE').length;
    const overdueTasksCount = user.tasks.filter(
      (task) =>
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
    ).length;

    return {
      name: user.name,
      email: user.email,
      role: user.role,
      totalProjects,
      assignedTasks: assignedTasksCount,
      completedTasks: completedTasksCount,
      overdueTasks: overdueTasksCount,
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