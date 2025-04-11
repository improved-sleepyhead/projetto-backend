import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './dto/user.dto';
import { ProjectSummary, TaskSummary, UserProfileDto } from './dto/user-profile.dto';
import { ParseIntPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { GlobalRolesGuard } from './guards/user-routes.guard';
import { Roles } from './decorators/user.decorator';

@Controller('user')
@UseGuards(JwtAuthGuard, GlobalRolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('current')
  @Auth()
  async getCurrentUser(@CurrentUser('id') userId: string,): Promise<UserDto> {
    return this.userService.getById(userId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Get('email/:email')
  async getByEmail(@Param('email') email: string) {
    return this.userService.getByEmail(email);
  }

  @Get()
  @Auth()
  @Roles('ADMIN')
  async getAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get(':id/profile')
  async getProfile(@Param('id') id: string): Promise<UserProfileDto> {
    return this.userService.getProfile(id);
  }

  @Get(':id/tasks')
  async getTotalTasks(@Param('id') id: string): Promise<TaskSummary[]> {
    return this.userService.getTotalTasks(id);
  }

  @Get(':id/projects')
  async getProjects(@Param('id') id: string): Promise<ProjectSummary[]> {
    return this.userService.getProjects(id);
  }

  @Get(':id/owned-projects')
  async getOwnedProjects(@Param('id') id: string) {
    return this.userService.getOwnedProjects(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}