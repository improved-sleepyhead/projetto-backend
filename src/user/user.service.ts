import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService){}
  async getById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id
      },
      include: {
        tasks: true
      }
    })
  }
}
