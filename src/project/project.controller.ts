import {Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UsePipes, ValidationPipe, Query} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';

import { ProjectService } from './project.service';

import { CreateProjectDto, ProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CurrentUser } from 'src/auth/decorators/user.decorator';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  @Auth()
  @UsePipes(new ValidationPipe())
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser('id') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.create(dto, userId);
  }

  @Get(':id')
  @Auth()
  async getById(
    @Param('id') id: string,
    @Query('includeTimestamps') includeTimestamps: boolean,
  ): Promise<ProjectDto> {
    return this.projectService.getById(id, includeTimestamps);
  }

  @Patch(':id')
  @Auth()
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Auth()
  async delete(@Param('id') id: string): Promise<void> {
    return this.projectService.delete(id);
  }

  @Post(':projectId/members/:userId')
  @Auth()
  async addMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.addMember(projectId, userId);
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(204)
  @Auth()
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.removeMember(projectId, userId);
  }
}