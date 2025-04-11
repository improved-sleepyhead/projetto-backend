import { IsEnum } from 'class-validator';
import { ProjectRole } from '@prisma/client';

export class UpdateRoleDto {
  @IsEnum(ProjectRole)
  role: ProjectRole;
}