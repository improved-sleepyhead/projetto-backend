import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ProjectService } from '../project.service';
  
  @Injectable()
  export class ProjectRolesGuard implements CanActivate {
    constructor(
      private readonly reflector: Reflector,
      private readonly projectService: ProjectService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );
  
      if (!requiredRoles) {
        return true; // Если роли не указаны, доступ разрешен
      }
  
      const request = context.switchToHttp().getRequest();
      const projectId = request.params.projectId || request.params.id; // Получаем ID проекта из параметров
      const currentUserId = request.user?.id; // Получаем ID текущего пользователя
  
      if (!projectId || !currentUserId) {
        throw new ForbiddenException('Invalid request');
      }
  
      const userRole = await this.projectService.getUserRole(projectId, currentUserId);
  
      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException('You do not have permission to perform this action');
      }
  
      return true;
    }
  }