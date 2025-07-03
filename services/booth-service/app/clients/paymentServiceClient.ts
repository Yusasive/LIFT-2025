import axios from 'axios';
import { CreatePaymentInput } from '../models/dto/CreatePaymentInput';

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:4005';
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;


export class PaymentServiceClient {
    private static async callInternalEndpoint(action: string, data: any, additionalHeaders: Record<string, string> = {}) {
        try {
            console.log('PAYMENT_SERVICE_URL', PAYMENT_SERVICE_URL);
            const response = await axios.post(`${PAYMENT_SERVICE_URL}/internal`, {
                action,
                data
            }, {
                headers: {
                    'x-internal-service-key': INTERNAL_SERVICE_KEY,
                    'x-service-name': 'booth-service',
                    'x-internal-call': 'true',
                    ...additionalHeaders
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error calling internal endpoint ${action}:`, error);
            throw error;
        }
    }

    static async createPayment(payment: CreatePaymentInput): Promise<any> {
        try {
            const response = await this.callInternalEndpoint('createPayment', payment);
            return response;
        } catch (error) {
            console.error('Token verification error:', error);
            return null;
        }
    }
}


