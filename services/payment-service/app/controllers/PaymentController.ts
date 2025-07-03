import { APIGatewayProxyEventV2 } from "aws-lambda";
import { PaymentService } from "../services/paymentService";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class PaymentController {
    constructor(@inject("PaymentService") private paymentService: PaymentService) {}

    async handlePayment(event: APIGatewayProxyEventV2) {
        const path = event.requestContext.http.path;
        const httpMethod = event.requestContext.http.method;

        switch(true) {
            case httpMethod === 'POST' && path === '/make-payment':
                return await this.paymentService.MakePayment(event);

            case httpMethod === 'POST' && path === '/verify-payment':
                return await this.paymentService.VerifyPayment(event);

            case httpMethod === 'GET' && path === '/get-payment-list':
                return await this.paymentService.GetPaymentList(event);

            case httpMethod === 'GET' && path === '/get-payment-all-payments':
                return await this.paymentService.GetPaymentAllPayments(event);
            default:
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Not Found'
                    })
                };
        }
    }
} 