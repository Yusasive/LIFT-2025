import { PaymentRepository } from "../repository/PaymentRepository";
import { inject, injectable } from "tsyringe";
import { CreatePaymentInput } from "../models/payment";


@injectable()
export class InternalService {
    constructor(@inject("PaymentRepository") private repository: PaymentRepository) {}

    async createPayment(payment: CreatePaymentInput) {
        try {
            const newPayment = await this.repository.createPayment(payment);
            return {
                success: true,
                data: newPayment
            }
        } catch (error) {
            console.log(error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    }
}