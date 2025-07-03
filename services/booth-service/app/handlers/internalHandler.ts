import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { container } from "tsyringe";
import { InternalService } from "../services/internalService";
import { initializeDb } from "../config/database";
import { BoothRepository } from "../repository/BoothRepository";
//import { BoothRepository } from "app/repository/BoothRepository";

// Register dependencies
container.register("BoothRepository", {
    useClass: BoothRepository
});

container.register("InternalService", {
    useClass: InternalService
});

// container.register("BoothRepository", {
//     useClass: InternalService
// });
// Internal service key for authentication
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY;

export const handler = async (event: APIGatewayProxyEventV2) => {
    try {
        // Initialize database connection
        await initializeDb();

        // Verify internal service key
        const serviceKey = event.headers['x-internal-service-key'];
        if (!serviceKey || serviceKey !== INTERNAL_SERVICE_KEY) {
            return {
                statusCode: 403,
                body: JSON.stringify({
                    success: false,
                    error: "Invalid internal service key"
                })
            };
        }

        const internalService = container.resolve(InternalService);
        const { action, data } = JSON.parse(event.body || '{}');

        switch (action) {
            case 'updateVerificationCode': {
                const { user_id, code, expiry } = data;
                const result = await internalService.updateVerificationCode(user_id, code, new Date(expiry));
                return {
                    statusCode: result.success ? 200 : 400,
                    body: JSON.stringify(result)
                };
            }
            case 'verifyCode': {
                const { email, code } = data;
                const result = await internalService.verifyCode(email, code);
                return {
                    statusCode: result.success ? 200 : 400,
                    body: JSON.stringify(result)
                };
            }
            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        success: false,
                        error: "Invalid action"
                    })
                };
        }
    } catch (error) {
        console.error('Internal service error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: "Internal service error",
                details: error instanceof Error ? error.message : String(error)
            })
        };
    }
}; 