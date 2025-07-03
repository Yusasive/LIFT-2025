import { IsArray, IsString, IsOptional, IsNumber, ValidateNested, ArrayMinSize, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { BoothItemInput } from "./BoothItemInput";

export class BoothReservationInput {
    @IsArray()
    @ArrayMinSize(1, { message: "At least one booth must be selected" })
    @ValidateNested({ each: true })
    @Type(() => BoothItemInput)
    booths: BoothItemInput[];

    @IsNumber({}, { message: "Booth amount must be a valid number" })
    @Min(0, { message: "Booth amount must be greater than or equal to 0" })
    boothAmount: number;


    @IsOptional()
    @IsString()
    remark?: string;

    @IsOptional()
    @IsNumber()
    @Min(1, { message: "Validity period must be at least 1 day" })
    @Max(365, { message: "Validity period cannot exceed 365 days" })
    validityPeriodDays?: number;

    constructor() {
        this.booths = [];
        this.remark = '';
        this.validityPeriodDays = 7;
    }
}