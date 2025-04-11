import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async updateRole(
    projectId: string,
    userId: string,
    dto: UpdateRoleDto,
  ): Promise<void> {
    const projectUser = await this.prisma.projectUser.findUnique({
      where: {
        userId_projectId: { userId, projectId },
      },
    });

    if (!projectUser) {
      throw new NotFoundException('User is not a member of the project');
    }

    await this.prisma.projectUser.update({
      where: {
        userId_projectId: { userId, projectId },
      },
      data: {
        role: dto.role,
      },
    });
  }
}