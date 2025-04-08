import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { hash } from 'argon2';
import { ProjectSummary, TaskSummary, UserProfileDto } from './dto/user-profile.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        tasks: {
          include: {
            project: true,
          },
        },
        projectsOwned: {
          include: {
            members: true,
          },
        },
        projects: true,
      },
    });
  }

  getByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async getProfile(id: string): Promise<UserProfileDto> {
    const user = await this.getById(id);

    if (!user) {
      throw new Error('User not found');
    }

    const totalProjects = user.projects.length;
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

  async getTotalTasks(id: string): Promise<TaskSummary[]> {
    const user = await this.getById(id);
    return user.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      projectId: task.projectId,
      projectName: task.project?.name || '',
      status: task.status,
      dueDate: task.dueDate,
    }));
  }

  async getProjects(id: string): Promise<ProjectSummary[]> {
    const user = await this.getById(id);
    return user.projects.map((project) => ({
      id: project.id,
      name: project.name,
    }));
  }

  async getOwnedProjects(id: string): Promise<ProjectSummary[]> {
    const user = await this.getById(id);
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