import { Length, IsNotEmpty, IsEmail, IsOptional, IsEnum } from "class-validator";
import { UserType } from "../UserType";

export class BasicProfileInput {
    @IsNotEmpty({ message: "First name is required" })
    @Length(3, 32)
    firstName: string;
  
    @IsNotEmpty({ message: "Last name is required" })
    @Length(3, 32)
    lastName: string;
  
    @IsNotEmpty({ message: "Address is required" })
    address: string;

    @IsOptional()
    address_line2?: string;

    @IsNotEmpty({ message: "City is required" })
    city: string;

    @IsNotEmpty({ message: "State is required" })
    state: string;

    @IsNotEmpty({ message: "Country is required" })
    country: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "User type is required" })
    @IsEnum(UserType)
    user_type: UserType;

    @IsNotEmpty({ message: "Phone is required" })
    phone: string;

    @IsOptional()
    company: string;

    @IsOptional()
    status: string;

    @IsOptional()
    booth_preference: string;

    @IsOptional()
    booth_type: string;

    constructor() {
        this.firstName = '';
        this.lastName = '';
        this.address = '';
        this.city = '';
        this.state = '';
        this.email = '';
        this.phone = '';
    }
}

export class ProfileInput {
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "User type is required" })
    @IsEnum(UserType)
    user_type: UserType;

    @IsOptional()
    @Length(3, 32)
    first_name: string;
  
    @IsOptional()
    @Length(3, 32)
    last_name: string;
  
    @IsOptional()
    @Length(3, 32)
    company: string;

    @IsOptional()
    status: string;
}