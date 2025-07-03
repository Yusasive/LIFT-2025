import { APIGatewayProxyEventV2 } from "aws-lambda";
import { AuthService } from "../services/AuthService";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class AuthController {
    constructor(@inject("AuthService") private authService: AuthService) {}

    async handleAuth(event: APIGatewayProxyEventV2) {
        const path = event.requestContext.http.path;
        const method = event.requestContext.http.method;
        const roleIdMatch = path.match(/^\/roles\/(\d+)$/);

        switch(true) {
            // Auth endpoints
            case path === '/auth/verification-token':
                return await this.authService.GetVerificationToken(event);
            
            case path === '/auth/verify-code':
                return await this.authService.VerifyCode(event);
            
            // Role management endpoints
            case method === 'POST' && path === '/roles':
                return await this.authService.CreateRole(event);

            case method === 'GET' && path === '/roles':
                return await this.authService.GetRoles(event);

            case method === 'GET' && roleIdMatch !== null:
                return await this.authService.GetRoleById(event, parseInt(roleIdMatch[1]));

            case method === 'PUT' && roleIdMatch !== null:
                return await this.authService.UpdateRole(event, parseInt(roleIdMatch[1]));

            case method === 'DELETE' && roleIdMatch !== null:
                return await this.authService.DeleteRole(event, parseInt(roleIdMatch[1]));

            case method === 'GET' && path === '/permissions':
                return await this.authService.GetPermissionTypesWithPermissions(event);

            default:
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Not Found'
                    })
                };
        }
    }
} 