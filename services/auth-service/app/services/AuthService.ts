import { APIGatewayProxyEventV2 } from "aws-lambda";
import jwt from "jsonwebtoken";
import { autoInjectable, inject } from "tsyringe";
import { SuccessResponse, ErrorResponse } from "../utility/response";
import { GenerateAccessCode } from "../utility/notification";
import { UserServiceClient } from "../clients/userServiceClient";
import { generateToken, validateToken } from "../utility/token";
import { RoleRepository } from "../repository/roleRepository";
import { CreateRoleDto, UpdateRoleDto } from "../models/dto/role.dto";
import { validateOrReject, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";

const APP_SERVICE_SECRET = process.env.APP_SERVICE_SECRET || "your_jwt_secret";

interface JWTPayload {
    user_id: number;
    email: string;
    phone: string;
    user_type: string;
}

@autoInjectable()
export class AuthService {
    constructor(
        @inject("RoleRepository") private roleRepository: RoleRepository
    ) {}

    // API Gateway event handlers
    async GetToken(event: APIGatewayProxyEventV2) {
        try {
            const userData = JSON.parse(event.body || '{}');
            const result = await generateToken(userData);
            
            if (!result.success) {
                return ErrorResponse(500, result.error || 'Unknown error');
            }

            return SuccessResponse(result.data || {});
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async VerifyToken(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            
            if (!token) {
                return ErrorResponse(403, "No token provided");
            }

            const result = await validateToken(token.split(" ")[1]);
            if (!result.success) {
                return ErrorResponse(403, result.error || 'Unknown error');
            }

            return SuccessResponse(result.data || { valid: false, payload: {} });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async GetVerificationToken(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            if (!token) {
                return ErrorResponse(403, "No token provided");
            }

            const payload = jwt.verify(token.split(" ")[1], APP_SERVICE_SECRET) as JWTPayload;
            if (!payload) {
                return ErrorResponse(403, "authorization failed!");
            }

            const { code, expiry } = GenerateAccessCode();
            
            const response = await UserServiceClient.updateVerificationCode(
                payload.user_id,
                code,
                expiry
            );

            if (!response.success) {
                throw new Error(response.error);
            }

            // await SendVerificationCode(code, payload.phone);

            return SuccessResponse({
                message: `verification code ${code} is sent to your registered mobile number!`,
            });
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async VerifyCode(event: APIGatewayProxyEventV2) {
        try {
            const token = event.headers.authorization;
            if (!token) {
                return ErrorResponse(403, "No token provided");
            }

            const payload = jwt.verify(token.split(" ")[1], APP_SERVICE_SECRET) as JWTPayload;
            if (!payload) {
                return ErrorResponse(403, "authorization failed!");
            }

            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            const { code } = body;
            
            if (!code) {
                return ErrorResponse(400, "verification code is required");
            }

            const response = await UserServiceClient.verifyCode(payload.email, code);

            if (!response.success) {
                return ErrorResponse(400, response.error);
            }

            return SuccessResponse(response.data);
        } catch (error) {
            console.log(error);
            return ErrorResponse(500, error);
        }
    }

    async CreateRole(event: APIGatewayProxyEventV2) {
        try {
            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            
            const createRoleDto = plainToClass(CreateRoleDto, body);
            await validateOrReject(createRoleDto);

            const role = await this.roleRepository.create(createRoleDto);
            
            return {
                statusCode: 201,
                body: JSON.stringify(role)
            };
        } catch (error: unknown) {
            console.error('Error creating role:', error);
            if (error instanceof Array && error[0] instanceof ValidationError) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid input',
                        errors: error.map(e => Object.values(e.constraints || {}))
                    })
                };
            }
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error'
                })
            };
        }
    }

    async GetRoles(event: APIGatewayProxyEventV2) {
        try {
            const roles = await this.roleRepository.findAll();
            
            return {
                statusCode: 200,
                body: JSON.stringify(roles)
            };
        } catch (error: unknown) {
            console.error('Error getting roles:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error'
                })
            };
        }
    }

    async GetRoleById(event: APIGatewayProxyEventV2, id: number) {
        try {
            const role = await this.roleRepository.findById(id);
            
            if (!role) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Role not found'
                    })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(role)
            };
        } catch (error: unknown) {
            console.error('Error getting role:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error'
                })
            };
        }
    }

    async UpdateRole(event: APIGatewayProxyEventV2, id: number) {
        try {
            const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
            const updateRoleDto = plainToClass(UpdateRoleDto, body);
            await validateOrReject(updateRoleDto);

            const role = await this.roleRepository.update(id, updateRoleDto);
            
            if (!role) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Role not found'
                    })
                };
            }

            return {
                statusCode: 200,
                body: JSON.stringify(role)
            };
        } catch (error: unknown) {
            console.error('Error updating role:', error);
            if (error instanceof Array && error[0] instanceof ValidationError) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'Invalid input',
                        errors: error.map(e => Object.values(e.constraints || {}))
                    })
                };
            }
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error'
                })
            };
        }
    }

    async DeleteRole(event: APIGatewayProxyEventV2, id: number) {
        try {
            const deleted = await this.roleRepository.delete(id);
            
            if (!deleted) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Role not found'
                    })
                };
            }

            return {
                statusCode: 204,
                body: ''
            };
        } catch (error: unknown) {
            console.error('Error deleting role:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Internal Server Error'
                })
            };
        }
    }

    async GetPermissionTypesWithPermissions(event: APIGatewayProxyEventV2) {
        try {
            const permissionTypes = await this.roleRepository.getPermissionTypesWithPermissions();
            return {
                statusCode: 200,
                body: JSON.stringify(permissionTypes)
            };
        } catch (error: unknown) {
            console.error('Error getting permission types with permissions:', error);
            return ErrorResponse(500, error);
        }
    }
    
} 