import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UserProfileDto {
  @IsNumber()
  totalProjects: number;

  @IsNumber()
  totalTasks: number;

  @IsNumber()
  totalTasksDifference: number;

  @IsNumber()
  assignedTasks: number;

  @IsNumber()
  assignedTasksDifference?: number;

  @IsNumber()
  completedTasks: number;

  @IsNumber()
  completedTasksDifference: number;

  @IsNumber()
  overdueTasks: number;

  @IsNumber()
  overdueTasksDifference: number;
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

  project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
  };
}