import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";``
import { EmailService } from "../services/EmailService";
import { EmailController } from "../controllers/EmailController";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";

container.register("EmailService", {
    useClass: EmailService
});

const baseHandler = async (event: APIGatewayProxyEventV2) => {
    const emailController = container.resolve(EmailController);
    return await emailController.handleEmail(event);
};

export const openHandler = middy(baseHandler)
    .use(jsonBodyParser())

export const handler = middy(baseHandler)
    .use(jsonBodyParser())
    // .use(authMiddleware());
