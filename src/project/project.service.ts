import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto, ProjectDto, UpdateProjectDto } from './dto/project.dto';
import { projectSelect } from './constants/project.constants';
import * as dayjs from 'dayjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ProjectService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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

  async getById(id: string, includeTimestamps = false): Promise<ProjectDto> {
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