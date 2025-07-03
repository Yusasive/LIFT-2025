import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { initializeDb } from "../config/database";
import { container } from "tsyringe";
import { PaymentRepository } from "../repository/PaymentRepository";
import { InternalService } from "../services/internalService";
import { CreatePaymentInput } from "../models/payment";

container.register("PaymentRepository", {
    useClass: PaymentRepository
});

container.register("InternalService", {
    useClass: InternalService
});



const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

export const handler = async (event: APIGatewayProxyEventV2) => {
    try {
        await initializeDb();

        const serviceKey = event.headers['x-internal-service-key'];
        if (!serviceKey || serviceKey !== INTERNAL_SERVICE_KEY) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    success: false,
                    error: "Invalid internal service key"
                })
            }
        }

        const internalService = container.resolve(InternalService);
        const { action, data } = JSON.parse(event.body || '{}');

        switch (action) {
            case 'createPayment':
                if (!data || !data.amount || !data.currency || !data.user_id || !data.transaction_id || !data.transactionStatus) {
                    console.log('data', data);
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            success: false,
                            error: 'Missing required fields: amount, currency, user_id, and transaction_id are required'
                        })
                    };
                }
                return await internalService.createPayment(data as CreatePaymentInput);
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        success: false,
                        error: 'Invalid action'
                    })
                }
        }
    } catch (error) {
        console.error('Error in internal handler:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: 'Internal server error'
            })
        }
    }
}