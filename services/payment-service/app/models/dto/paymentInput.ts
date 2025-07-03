import { IsString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { Currency, PaymentStatus } from "../payment";

export class PaymentInput {
    @IsNumber()
    amount: number;

    @IsString()
    email: string;

    @IsNumber()
    user_id: number;

    @IsEnum(Currency)
    currency: Currency;

    @IsNumber()
    transaction_id: number;

    constructor() {
        this.amount = 0;
        this.user_id = 0;
        this.currency = Currency.NGN;
        this.email = '';
      
    }
} 

export class VerifyPaymentInput {
    @IsString()
    reference: string;

    constructor() {
        this.reference = '';
    }
}

export class UpdatePaymentInput {
    @IsEnum(PaymentStatus)
    payStackstatus: PaymentStatus;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    reference?: string;

    @IsString()
    @IsOptional()
    transaction_id?: number;


    constructor() {
        this.payStackstatus = PaymentStatus.PENDING;
    }
}
