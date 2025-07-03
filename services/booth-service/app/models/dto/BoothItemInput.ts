import { IsString, IsNumber, MinLength, Min } from "class-validator";

export class BoothItemInput {
    @IsString()
    @MinLength(1, { message: "Sector is required" })
    sector: string;

    @IsString()
    @MinLength(1, { message: "Booth number is required" })
    boothNum: string;

    @IsNumber({}, { message: "Booth price must be a valid number" })
    @Min(0, { message: "Booth price must be greater than or equal to 0" })
    boothPrice: number;

    @IsString()
    @MinLength(1, { message: "Booth type is required" })
    boothType: string;

    constructor() {
        this.sector = '';
        this.boothNum = '';
        this.boothPrice = 0;
        this.boothType = '';
    }
}