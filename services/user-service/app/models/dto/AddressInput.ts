import { IsString, IsNumber, IsNotEmpty, IsOptional } from "class-validator";

export class AddressInput {
    @IsNumber()
    address_id: number;

    @IsNotEmpty({ message: "Address is required" })
    @IsString()
    address_line1: string;

    @IsOptional()
    @IsString()
    address_line2?: string;

    @IsNotEmpty({ message: "City is required" })
    @IsString()
    city: string;

    @IsNotEmpty({ message: "State is required" })
    @IsString()
    state: string;

    @IsOptional()
    @IsString()
    post_code: string;

    @IsNotEmpty({ message: "Country is required" })
    @IsString()
    country: string;

    constructor() {
        this.address_id = 0;
        this.address_line1 = '';
        this.city = '';
        this.post_code = '';
        this.country = '';
    }
}