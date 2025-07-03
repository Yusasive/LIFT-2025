import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";
import { BoothController } from "../controllers/BoothController";
import { BoothService } from "../services/BoothService";
import { BoothRepository } from "../repository/BoothRepository";
import middy from "@middy/core";
import jsonBodyParser from "@middy/http-json-body-parser";
import { authMiddleware } from "../middleware/authMiddleware";
import { initializeDb } from "../config/database";

// Register dependencies
container.register("BoothRepository", {
    useClass: BoothRepository
});

container.register("BoothService", {
    useClass: BoothService
});


const baseHandler = async (event: APIGatewayProxyEventV2) => {
    // Initialize database connection
    await initializeDb();
    
    const boothController = container.resolve(BoothController);
    return await boothController.handleBooth(event);
};

export const handler = middy(baseHandler)
    .use(jsonBodyParser())
    .use(authMiddleware());