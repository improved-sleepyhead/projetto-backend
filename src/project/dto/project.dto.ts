export class CreateProjectDto {
    name: string;
    description?: string;
  }
  
  export class UpdateProjectDto {
    name?: string;
    description?: string;
  }
  
  import { User } from '@prisma/client';
  
  export class ProjectDto {
    id: string;
    name: string;
    description?: string;
    owner: User;
    members: User[];
    tasks: any[];
  }