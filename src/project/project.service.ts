import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto, ProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, ownerId: string): Promise<ProjectDto> {
    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        owner: {
          connect: { id: ownerId },
        },
      },
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
    });

    return this.formatProjectResponse(project);
  }

  async getById(id: string, includeTimestamps = false): Promise<ProjectDto> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.formatProjectResponse(project, includeTimestamps);
  }

  async getAll(includeTimestamps = false): Promise<ProjectDto[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
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
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
    });

    return this.formatProjectResponse(updatedProject);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, userId: string): Promise<ProjectDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: userId },
        },
      },
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
    });

    return this.formatProjectResponse(project);
  }

  async removeMember(projectId: string, userId: string): Promise<ProjectDto> {
    const project = await this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: userId },
        },
      },
      include: {
        owner: true,
        members: true,
        tasks: true,
      },
    });

    return this.formatProjectResponse(project);
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