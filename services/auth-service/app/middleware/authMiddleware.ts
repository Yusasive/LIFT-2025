import { APIGatewayProxyEventV2 } from "aws-lambda";
import { validateToken } from "../utility/token";
import middy from "@middy/core";
import { container } from "tsyringe";
import { RoleRepository } from "../repository/roleRepository";
import { PermissionService } from "../services/PermissionService";
import { initializeDb } from "../config/database";

export const authMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventV2> => {
    return {
        before: async (request) => {
            try {
                // Initialize database connection first
                await initializeDb();

                // Resolve dependencies after database initialization
                const permissionService = container.resolve(PermissionService);
                const roleRepository = container.resolve(RoleRepository);

                // Get the service name from the request headers
                const service = request.event.headers['x-service-name'];
                
                let token: string | undefined;
                
                if (service) {
                    // Internal service call - use token from Authorization header
                    token = request.event.headers.authorization?.split(" ")[1];
                } else {
                    // User request - get token from cookie
                    const cookies = request.event.cookies || [];
                    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
                    token = authCookie ? authCookie.split('=')[1] : undefined;
                }

                if (!token) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({
                            message: "Authentication required"
                        })
                    };
                }

                const result = await validateToken(token);
                if (!result.success) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({
                            message: result.error || "Invalid authentication 2026"
                        })
                    };
                }

                // Add the validated token payload to the event for use in handlers
                const payload = result.data?.payload as { user_id: number, role_id: number };
                request.event.requestContext.authorizer = {
                    jwt: {
                        claims: payload
                    }
                };

                // Get the service name from the request headers
                const method = request.event.requestContext.http.method;
                const path = request.event.requestContext.http.path;

                // Get required permission for the endpoint
                const requiredPermission = await permissionService.getRequiredPermission(
                    service || 'auth-service',
                    method,
                    path
                );

                if (requiredPermission) {
                    const role = await roleRepository.findById(payload.role_id);
                    
                    if (!role) {
                        return {
                            statusCode: 403,
                            body: JSON.stringify({
                                message: "Invalid role"
                            })
                        };
                    }

                    const hasPermission = role.rolePermissions?.some(
                        rp => rp.permission.name === requiredPermission
                    );
                    
                    if (!hasPermission) {
                        return {
                            statusCode: 401,
                            body: JSON.stringify({
                                message: "You are not authorized to access this resource!"
                            })
                        };
                    }
                }

                return undefined;
            } catch (error) {
                console.error('Auth middleware error:', error);
                return {
                    statusCode: 403,
                    body: JSON.stringify({
                        message: "Authentication failed"
                    })
                };
            }
        }
    };
}; 