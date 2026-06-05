import { Module } from '@nestjs/common'
import { RoleService } from './role.service'
import { RoleController } from './role.controller'
import { AuthModule } from 'src/auth/auth.module'
import { ProjectModule } from 'src/project/project.module'

@Module({
	imports: [AuthModule, ProjectModule],
	controllers: [RoleController],
	providers: [RoleService]
})
export class RoleModule {}
