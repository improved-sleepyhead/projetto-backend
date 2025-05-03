export class UserDto {
    id: string;
    name: string;
    email: string;
}

export class CreateProjectDto {
    name: string;
    description?: string;
}

export class UpdateProjectDto {
    name?: string;
    description?: string;
}

export class ProjectDto {
    id: string;
    name: string;
    description?: string;
    owner: UserDto;
    members: UserDto[];
    tasks: any[];
}

export class ProjectStatisticsDto {
    totalTasks: number;
    assignedTasks: number;
    completedTasks: number;
    overdueTasks: number;
    incompleteTasks: number;

    totalTasksDifference: number;
    assignedTasksDifference: number;
    completedTasksDifference: number;
    incompleteTasksDifference: number;
    overdueTasksDifference: number;
}