import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { UserRepository } from "../repository/userRepository";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../middleware/authMiddleware";
import { initializeDb } from "../config/database";

// Register dependencies
container.register("UserRepository", {
    useClass: UserRepository
});

container.register("UserService", {
    useClass: UserService
});

const baseHandler = async (event: APIGatewayProxyEventV2) => {
    // Initialize database connection
    await initializeDb();
    
    const userController = container.resolve(UserController);
    return await userController.handleUser(event);
};

export const openHandler = middy(baseHandler)
    .use(jsonBodyParser())

export const handler = middy(baseHandler)
    .use(jsonBodyParser())
    .use(authMiddleware());