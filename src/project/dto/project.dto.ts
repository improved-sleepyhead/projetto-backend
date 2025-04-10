import { User } from '@prisma/client';

export interface IUser {
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
    owner: IUser;
    members: IUser[];
    tasks: any[];
}