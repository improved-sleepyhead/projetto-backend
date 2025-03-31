import { IsString, IsOptional } from 'class-validator';

export class UserProfileDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  role: string;

  @IsOptional()
  projectsOwned?: ProjectSummary[];

  @IsOptional()
  assignedTasks?: TaskSummary[];
}

export class ProjectSummary {
  @IsString()
  id: string;

  @IsString()
  name: string;
}

export class TaskSummary {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  projectId: string;

  @IsString()
  projectName: string;

  @IsString()
  status: string;

  @IsOptional()
  dueDate?: Date;
}