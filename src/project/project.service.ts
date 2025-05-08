import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto, ProjectDto, ProjectStatisticsDto, UpdateProjectDto } from './dto/project.dto';
import { projectSelect } from './constants/project.constants';
import * as dayjs from 'dayjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private async ensureUserIsMember(projectId: string, userId: string): Promise<void> {
    const member = await this.prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });
  
    if (!member) {
      throw new NotFoundException('User is not a member of the project');
    }
  }

  async create(dto: CreateProjectDto, ownerId: string): Promise<ProjectDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        owner: {
          connect: { id: ownerId },
        },
        members: {
          create: [
            {
              userId: ownerId,
              role: 'PROJECT_ADMIN',
            },
          ],
        },
      },
      select: projectSelect,
    });

    return this.formatProjectResponse(project);
  }

  async getById(id: string, userId: string, includeTimestamps = false): Promise<ProjectDto> {
    await this.ensureUserIsMember(id, userId);
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: projectSelect,
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.formatProjectResponse(project, includeTimestamps);
  }

  async getAll(includeTimestamps = false): Promise<ProjectDto[]> {
    const projects = await this.prisma.project.findMany({
      select: projectSelect,
    });

    return projects.map((project) => this.formatProjectResponse(project, includeTimestamps));
  }

  async getStatistics(projectId: string): Promise<ProjectStatisticsDto> {
    const now = dayjs();
    const oneMonthAgo = now.subtract(30, 'days').toDate();
    const twoMonthsAgo = now.subtract(60, 'days').toDate();

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

      incompleteTasks,
      incompleteTasksLastMonth,
      incompleteTasksPreviousMonth,
    ] = await Promise.all([
      this.prisma.task.count({ where: { projectId } }),
  
      this.prisma.task.count({
        where: {
          projectId,
          createdAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),

      this.prisma.task.count({
        where: { projectId, assigneeId: { not: null } },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          assigneeId: { not: null },
          createdAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          assigneeId: { not: null },
          createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),

      this.prisma.task.count({
        where: { projectId, status: 'DONE' },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          status: 'DONE',
          updatedAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          status: 'DONE',
          updatedAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),

      this.prisma.task.count({
        where: {
          projectId,
          dueDate: { lte: now.toDate() },
          status: { not: 'DONE' },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          dueDate: { lte: now.toDate(), gte: oneMonthAgo },
          status: { not: 'DONE' },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          dueDate: { lte: now.toDate(), gte: twoMonthsAgo, lt: oneMonthAgo },
          status: { not: 'DONE' },
        },
      }),

      this.prisma.task.count({
        where: {
          projectId,
          status: { not: 'DONE' },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          status: { not: 'DONE' },
          createdAt: { gte: oneMonthAgo },
        },
      }),
      this.prisma.task.count({
        where: {
          projectId,
          status: { not: 'DONE' },
          createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo },
        },
      }),
    ]);

    return {
      totalTasks,
      assignedTasks,
      completedTasks,
      overdueTasks,
      incompleteTasks,
  
      totalTasksDifference: tasksLastMonth - tasksPreviousMonth,
      assignedTasksDifference: assignedTasksLastMonth - assignedTasksPreviousMonth,
      completedTasksDifference: completedTasksLastMonth - completedTasksPreviousMonth,
      overdueTasksDifference: overdueTasksLastMonth - overdueTasksPreviousMonth,
      incompleteTasksDifference: incompleteTasksLastMonth - incompleteTasksPreviousMonth,
    };
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDto> {
    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
      select: projectSelect,
    });

    return this.formatProjectResponse(updatedProject);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    });
  }

  async generateInviteLink(projectId: string): Promise<string> {
    const payload = {
      projectId,
      expiresAt: dayjs().add(7, 'days').toISOString(),
    };

    const token = this.jwtService.sign(payload);
    return `${process.env.BASE_URL}/main/projects/${projectId}/join/${token}`;
  }

  async joinByInviteToken(token: string, userId: string): Promise<ProjectDto> {
    try {
      const payload = this.jwtService.verify(token);

      if (dayjs().isAfter(dayjs(payload.expiresAt))) {
        throw new Error('Invite link has expired');
      }

      const projectId = payload.projectId;

      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
        select: projectSelect,
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      const existingMember = await this.prisma.projectUser.findUnique({
        where: {
          userId_projectId: { userId, projectId },
        },
      });

      if (existingMember) {
        throw new Error('User is already a member of the project');
      }

      await this.prisma.projectUser.create({
        data: {
          userId,
          projectId,
          role: 'DEVELOPER',
        },
      });

      return this.formatProjectResponse(project);
    } catch (error) {
      throw new NotFoundException('Invalid or expired invite link');
    }
  }

  async addMember(projectId: string, userId: string): Promise<ProjectDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          create: [{ userId }],
        },
      },
      include: {
        members: true,
      },
    });
  
    return this.formatProjectResponse(project);
  }

  async removeMember(projectId: string, userId: string): Promise<ProjectDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          deleteMany: [{ userId }],
        },
      },
      include: {
        members: true,
      },
    });
  
    return this.formatProjectResponse(project);
  }

  async getAllMembers(projectId: string): Promise<any[]> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project.members;
  }

  async getUserRole(projectId: string, userId: string): Promise<string> {
    const projectUser = await this.prisma.projectUser.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!projectUser) {
      throw new NotFoundException('User is not a member of the project');
    }

    return projectUser.role;
  }

  private formatProjectResponse(project: any, includeTimestamps = false): ProjectDto {
    const { createdAt, updatedAt, ...rest } = project;

    if (includeTimestamps) {
      return {
        ...rest,
        createdAt,
        updatedAt,
      };
    }

    return rest;
  }
}