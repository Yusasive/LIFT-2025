import { inject, autoInjectable } from "tsyringe";
import { Repository, DataSource } from "typeorm";
import { Payment } from "../models/entities/Payment.entity";
import { CreatePaymentInput } from "../models/payment";
import { UpdatePaymentInput } from "../models/dto/paymentInput";

@autoInjectable()
export class PaymentRepository {
    private paymentRepository: Repository<Payment>;


    constructor(@inject("DataSource") private dataSource: DataSource) {}

    private async initializeRepositories(){
        if (!this.dataSource.isInitialized) {
            await this.dataSource.initialize();
        }
        this.paymentRepository = this.dataSource.getRepository(Payment);
    }

    async createPayment(input: CreatePaymentInput): Promise<Payment> {
        await this.initializeRepositories();
        const payment = this.paymentRepository.create({
            amount: input.amount,
            currency: input.currency,
            user_id: input.user_id,
            transactionId: input.transaction_id,
            transactionStatus: input.transactionStatus
        });
        return await this.paymentRepository.save(payment);
    }

    async updatePaymentStatus(input: UpdatePaymentInput): Promise<Payment> {
        await this.initializeRepositories();
        const payment = await this.findPaymentByTransactionOrReference(input.transaction_id, input.reference);
        if (!payment) {
            throw new Error("Payment not found!");
        }

        payment.payStackstatus = input.payStackstatus;
        payment.transactionStatus = input.payStackstatus;
        if (input.transaction_id) {
            payment.transactionId = input.transaction_id;
        }
        if (input.reference) {
            payment.reference = input.reference;
        }
        if (input.email) {
            payment.email = input.email;
        }
        return await this.paymentRepository.save(payment);
    }

    async findPaymentByTransactionOrReference(transaction_id?: number, reference?: string): Promise<Payment | null> {
        await this.initializeRepositories();
        
        if (!transaction_id && !reference) {
            throw new Error("Either transaction_id or reference must be provided");
        }

        const whereClause: any = {};
        if (transaction_id) {
            whereClause.transactionId = transaction_id;
        } else if (reference) {
            whereClause.reference = reference;
        }

        console.log("whereClause", whereClause);

        return await this.paymentRepository.findOneBy(whereClause);
    }

    async getPaymentList(user_id?: number): Promise<Payment[]> {
        await this.initializeRepositories();
        const whereClause: any = {};
        if (user_id) {
            whereClause.user_id = user_id;
        }
        return await this.paymentRepository.find({ where: whereClause });
    }
}
