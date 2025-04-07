import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id/profile')
  async getProfile(@Param('id') id: string) {
    return this.userService.getProfile(id);
  }

  @Get(':id/tasks')
  async getTotalTasks(@Param('id') id: string) {
    return this.userService.getTotalTasks(id);
  }

  @Get(':id/projects')
  async getProjects(@Param('id') id: string) {
    return this.userService.getProjects(id);
  }

  @Get(':id/owned-projects')
  async getOwnedProjects(@Param('id') id: string) {
    return this.userService.getOwnedProjects(id);
  }

  @Post()
  async create(@Body() dto: any) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.userService.update(id, dto);
  }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return this.userService.delete(id);
  // }
}