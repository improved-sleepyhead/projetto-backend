import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UserProfileDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  role: string;

  @IsNumber()
  totalProjects: number;

  @IsNumber()
  assignedTasks: number;

  @IsNumber()
  completedTasks: number;

  @IsNumber()
  overdueTasks: number;
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