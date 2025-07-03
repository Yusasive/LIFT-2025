import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";
import { authMiddleware } from "../middleware/authMiddleware";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { PaymentController } from "../controllers/PaymentController";
import { PaymentService } from "../services/paymentService";
import { PaymentRepository } from "../repository/PaymentRepository";
import { initializeDb } from "../config/database";


container.register("PaymentRepository", {
    useClass: PaymentRepository
});

container.register("PaymentService", {
    useClass: PaymentService
});

export const baseHandler = async (event: APIGatewayProxyEventV2) => {
    // Initialize database connection
    await initializeDb();
    
    const paymentController = container.resolve(PaymentController);
    return await paymentController.handlePayment(event);
};

export const handler = middy(baseHandler)
    .use(jsonBodyParser());

export const protectedHandler = middy(baseHandler)
    .use(jsonBodyParser())
    .use(authMiddleware()); 