import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    created_by!: string;

    @IsArray()
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(id => Number(id));
        }
        return value;
    })
    permissions?: number[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean = true;
}

export class UpdateRoleDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    @Transform(({ value }) => {
        if (Array.isArray(value)) {
            return value.map(id => Number(id));
        }
        return value;
    })
    permissions?: number[];

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
} 