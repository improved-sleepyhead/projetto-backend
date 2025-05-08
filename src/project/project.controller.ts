import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator';
import { Roles } from './decorators/roles.decorator';

import { ProjectService } from './project.service';
import { CreateProjectDto, ProjectDto, ProjectStatisticsDto, UpdateProjectDto } from './dto/project.dto';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { ProjectRolesGuard } from './guards/project-routes.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard, ProjectRolesGuard)
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
    @CurrentUser('id') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.getById(id, userId, includeTimestamps);
  }

  @Patch(':id')
  @Auth()
  @Roles('PROJECT_ADMIN')
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
  @Roles('PROJECT_ADMIN')
  async delete(@Param('id') id: string): Promise<void> {
    return this.projectService.delete(id);
  }

  @Post(':projectId/members/:userId')
  @Auth()
  @Roles('PROJECT_ADMIN', 'MANAGER')
  async addMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.addMember(projectId, userId);
  }

  @Get(':id/statistics')
  @Auth()
  async getProjectStatistics(
    @Param('id') projectId: string,
  ): Promise<ProjectStatisticsDto> {
    return this.projectService.getStatistics(projectId);
  }

  @Post(':projectId/invite-link')
  @Auth()
  @Roles('PROJECT_ADMIN', 'MANAGER')
  async generateInviteLink(
    @Param('projectId') projectId: string,
  ): Promise<{ inviteLink: string }> {
    const inviteLink = await this.projectService.generateInviteLink(projectId);
    return { inviteLink };
  }

  @Post('accept-invite')
  @Auth()
  async acceptInvite(
    @Body('token') token: string,
    @CurrentUser('id') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.joinByInviteToken(token, userId);
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(204)
  @Auth()
  @Roles('PROJECT_ADMIN', 'MANAGER')
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string,
  ): Promise<ProjectDto> {
    return this.projectService.removeMember(projectId, userId);
  }

  @Get(':projectId/members')
  @Auth()
  async getAllMembers(@Param('projectId') projectId: string): Promise<any[]> {
    return this.projectService.getAllMembers(projectId);
  }
}