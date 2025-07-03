import { IsNumber, IsNotEmpty, IsBoolean } from "class-validator";

export class UpdateUserStatusInput {
    @IsNumber()
    @IsNotEmpty()
    user_id: number;

    @IsBoolean()
    @IsNotEmpty()
    is_active: boolean;
}

