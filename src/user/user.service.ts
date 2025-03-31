import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { hash } from 'argon2';
import { User as PrismaUser } from '@prisma/client'; 

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

  async getProfile(id: string): Promise<any> {
    const user = await this.getById(id);

    if (!user) {
      throw new Error('User not found');
    }

    const totalProjects = user.projectsOwned.length;
    const totalTasks = user.tasks.length;
    const assignedTasks = user.tasks.filter((task) => task.assigneeId === id);
    const completedTasks = assignedTasks.filter((task) => task.status === 'DONE').length;
    const overdueTasks = assignedTasks.filter(
      (task) =>
        task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
    ).length;

    const projects = user.projectsOwned.map((project) => ({
      ...project,
      members: project.members.map((member: PrismaUser) => ({ // Явно указываем тип
        id: member.id,
        name: member.name,
        email: member.email,
      })),
    }));

    const assignedTasksList = assignedTasks.map((task) => ({
      ...task,
      projectName: task.project?.name || '',
    }));

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      overdueTasks,
      projects,
      assignedTasks: assignedTasksList,
    };
  }

  async create(dto: any) {
    const hashedPassword = await hash(dto.password);

    return this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
    });
  }

  async update(id: string, dto: any) {
    let data = dto;

    if (dto.password) {
      data = { ...dto, password: await hash(dto.password) };
    }

    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}