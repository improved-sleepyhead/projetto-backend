import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectModule } from './project/project.module';
import { CommentModule } from './comment/comment.module';
import { TaskModule } from './task/task.module';
import { RoleModule } from './role/role.module';

@Module({
  imports: [ConfigModule.forRoot(), AuthModule, UserModule, ProjectModule, CommentModule, TaskModule, RoleModule]
})
export class AppModule {}