import { IsString, Length, IsEnum } from "class-validator";
import { LoginInput } from "./LoginInput";
import { UserType } from "../UserType";

export class SignupInput extends LoginInput {
    @IsString()
    @Length(10, 13)
    phone: string;

    @IsEnum(UserType)
    user_type: UserType;

    @IsString()
    company_name: string;

    @IsString()
    local: string;

    constructor() {
        super();
        this.phone = '';
        this.user_type = UserType.Attendee;
        this.company_name = '';
        this.local = '';
    }
} 