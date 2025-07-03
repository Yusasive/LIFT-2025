import "reflect-metadata";
import { APIGatewayProxyEventV2 } from "aws-lambda";
import { generateToken, validateToken } from "../utility/token";
import { container } from "tsyringe";
import { RoleRepository } from "../repository/roleRepository";
import { InternalService } from "../services/InternalService";
import { initializeDb } from "../config/database";


// Register dependencies
container.register("RoleRepository", {
    useClass: RoleRepository
});

container.register("InternalService", {
    useClass: InternalService
});

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
            case 'getToken': {
                const result = await generateToken(data);
                return {
                    statusCode: result.success ? 200 : 500,
                    body: JSON.stringify(result)
                };
            }

            case 'verifyToken': {
                const { token } = data;
                const result = await validateToken(token);
                return {
                    statusCode: result.success ? 200 : 403,
                    body: JSON.stringify(result)
                };
            }

            case 'getRoleByName': {
                const { name } = data;
                const result = await internalService.getRoleByName(name);
                return {
                    statusCode: 200,
                    body: JSON.stringify(result)
                };
            }

            case 'checkPermission': {
                const { permission, payload } = data;
                const serviceName = event.headers['x-service-name'] || 'user-service';
                
                if (!payload?.role_id) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({
                            success: false,
                            error: "Invalid payload"
                        })
                    };
                }

                // Check the permission
                const hasPermission = await internalService.checkPermission(
                    payload.role_id,
                    permission,
                    serviceName
                );

                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: hasPermission
                    })
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
                error: "Internal service error"
            })
        };
    }
}; 