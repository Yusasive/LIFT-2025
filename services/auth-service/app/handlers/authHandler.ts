import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { RoleRepository } from "../repository/roleRepository";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../middleware/authMiddleware";
import { initializeDb } from "../config/database";

// Register dependencies
container.register("AuthService", {
    useClass: AuthService
});

container.register("RoleRepository", {
    useClass: RoleRepository
});

export const baseHandler = async (event: APIGatewayProxyEventV2) => {
    await initializeDb();

    const authController = container.resolve(AuthController);
    return await authController.handleAuth(event);
};


export const handler = middy(baseHandler)
    .use(jsonBodyParser());

export const protectedHandler = middy(baseHandler)
    .use(jsonBodyParser())
    .use(authMiddleware()); 