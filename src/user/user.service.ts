import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { hash } from 'argon2';

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

  getByEmail(email:string){
    return this.prisma.user.findUnique({
      where: {
        email
      }
    })
  }

  async getProfile(id: string) {
    const profile = await this.getById(id)
  }

  async create(dto:AuthDto){
    const user = {
      email: dto.email,
      name: dto.name,
      password: await hash(dto.password)
    }

    return this.prisma.user.create({
      data: user,
    })
  }

  async update(id: string, dto: UserDto) {
    let data = dto

    if (dto.password) {
      data = {...dto, password: await hash(dto.password)}
    }

    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    })
  }
}
