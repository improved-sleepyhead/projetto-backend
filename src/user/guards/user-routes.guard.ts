import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class GlobalRolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.get<string[]>(
        'roles',
        context.getHandler(),
      );

      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user || !user.role) {
        throw new ForbiddenException('User is not authenticated or role is missing');
      }

      const hasRequiredRole = requiredRoles.includes(user.role);

      if (!hasRequiredRole) {
        throw new ForbiddenException('You do not have permission to perform this action');
      }

      return true;
    }
}