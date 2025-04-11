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