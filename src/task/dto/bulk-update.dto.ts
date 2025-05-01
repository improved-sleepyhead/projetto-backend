import { IsString, IsNumber, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { TaskStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateTaskOrderItemDto {
  @IsString()
  id: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsNumber()
  position: number;
}

export class UpdateTaskOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTaskOrderItemDto)
  tasks: UpdateTaskOrderItemDto[];
}