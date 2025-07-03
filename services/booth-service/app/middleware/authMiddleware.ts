import { APIGatewayProxyEventV2 } from "aws-lambda";
import middy from "@middy/core";
import { AuthServiceClient } from "../clients/authServiceClient";

export const authMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEventV2> => {
    return {
        before: async (request) => {
            try {

                if (request.event.requestContext.http.method === 'OPTIONS') {
                    return {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': request.event.headers.origin || '*',
                            'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
                            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
                            'Access-Control-Allow-Credentials': 'true'
                        }
                    };
                }

                if (request.event.rawPath === '/signup' || 
                    request.event.rawPath === '/login' || 
                    request.event.rawPath === '/client/login' ||
                    request.event.rawPath === '/client/register'
                    
                ) {
                    return undefined;
                }

                // Check for internal service call
                const isInternalCall = request.event.headers['x-service-name'];
                let token: string | undefined;

                if (isInternalCall) {
                    token = request.event.headers.authorization?.split(" ")[1];
                } else {
                    const cookies = request.event.cookies || [];
                    const authCookie = cookies.find(cookie => cookie.startsWith('auth_token='));
                    token = authCookie ? authCookie.split('=')[1] : undefined;
                }
                
                if (!token) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({
                            message: "Authentication required 2025"
                        })
                    };
                }

                const payload = await AuthServiceClient.verifyToken(token);
                if (!payload) {
                    return {
                        statusCode: 403,
                        body: JSON.stringify({
                            message: "Invalid authentication 2027"
                        })
                    };
                }

                // Add the validated token payload to the request context
                request.event = {
                    ...request.event,
                    requestContext: {
                        ...request.event.requestContext,
                        authorizer: {
                            jwt: {
                                claims: payload
                            }
                        }
                    }
                };

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