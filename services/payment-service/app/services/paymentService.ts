import axios from 'axios';
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Currency, PaymentStatus } from '../models/payment';
import { plainToClass } from 'class-transformer';
import { PaymentInput, VerifyPaymentInput, UpdatePaymentInput } from '../models/dto/paymentInput';
import { validate } from 'class-validator';
import { AppValidationError } from '../utility/errors';
import { autoInjectable, inject } from 'tsyringe';
import { PaymentRepository } from '../repository/PaymentRepository';
import { ErrorResponse, SuccessResponse } from '../utility/response';

@autoInjectable()
export class PaymentService {
    constructor(
        @inject("PaymentRepository") private paymentRepository: PaymentRepository
    ) {}

    private readonly secretKey: string = process.env.PAYSTACK_SECRET_KEY || '';
    private readonly baseUrl: string = 'https://api.paystack.co';

    private getAmountInKobo(amount: number, currency: Currency): number {
        // Convert amount to smallest currency unit (kobo/cents)
        const multipliers: Record<Currency, number> = {
            NGN: 100,  // 1 NGN = 100 kobo
            USD: 100,  // 1 USD = 100 cents
            GHS: 100,  // 1 GHS = 100 pesewas
            ZAR: 100,  // 1 ZAR = 100 cents
            KES: 100   // 1 KES = 100 cents
        };
        return amount * multipliers[currency];
    }

    async MakePayment(event: APIGatewayProxyEventV2) {
        try {
            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            const input = plainToClass(PaymentInput, body);
            const validationError = await validate(input);

            if (validationError.length > 0) {
                throw new AppValidationError(validationError);
            }

            try {
                // Initialize payment with Paystack
                const response = await axios.post(
                    `${this.baseUrl}/transaction/initialize`,
                    {
                        amount: this.getAmountInKobo(input.amount, input.currency),
                        email: input.email,
                        currency: input.currency,
                        callback_url: `${process.env.CLIENT_URL}/payment-checkout`,
                        metadata: {
                            cancellation_url: `${process.env.CLIENT_URL}/payment/cancel`,
                        }
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${this.secretKey}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

            console.log("Paystack payment response", response.data);
            console.log("input", input);

            const updateInput = new UpdatePaymentInput();
            updateInput.transaction_id = input.transaction_id;
            updateInput.email = input.email;
            updateInput.reference = response.data.data.reference;
            updateInput.payStackstatus = response.data.data.status as PaymentStatus;
            const payment = await this.paymentRepository.updatePaymentStatus(updateInput);


            return {
                payment,
                authorization_url: response.data.data.authorization_url
            };
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Paystack API error:', error.response?.data);
                    throw new Error(error.response?.data?.message || 'Failed to initialize payment with Paystack');
                }
                throw error;
            }
        } catch (error) {
            console.error('Payment initialization error:', error);
            throw error;
        }
    }

    async VerifyPayment(event: APIGatewayProxyEventV2) {
        try {
            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            const input = plainToClass(VerifyPaymentInput, body);
            const validationError = await validate(input);

            if (validationError.length > 0) {
                throw new AppValidationError(validationError);
            }

            const response = await axios.get(
                `${this.baseUrl}/transaction/verify/${input.reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`
                    }
                }
            );

            const updateInput = new UpdatePaymentInput();
            updateInput.payStackstatus = response.data.data.status as PaymentStatus;
            updateInput.reference = input.reference;

            const payment = await this.paymentRepository.updatePaymentStatus(updateInput);

            return payment;
        } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
        }
    }

    async GetPaymentList(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");
  
            // Check if user has permission to read profile
            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'read:payment',
            //     'payment-service',
            //     payload
            // );
  
            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to access this resource!");
            // }

            const payments = await this.paymentRepository.getPaymentList(payload.user_id);
            return SuccessResponse(payments);
        } catch (error) {
            console.error('Payment list error:', error);
            throw error;
        }
    }

    async GetPaymentAllPayments(event: APIGatewayProxyEventV2) {
        try {
            const payload = event.requestContext.authorizer?.jwt?.claims;
            if (!payload) return ErrorResponse(403, "authentication failed!");

            // const permissionResult = await AuthServiceClient.checkPermission(
            //     'read:payments',
            //     'payment-service',
            //     payload
            // );

            // if (!permissionResult.success) {
            //     return ErrorResponse(401, "You are not authorized to access this resource!");
            // }

            const payments = await this.paymentRepository.getPaymentList();
            return SuccessResponse(payments);
        } catch (error) {
            console.error('Payment list error:', error);
            throw error;
        }
    }
} 