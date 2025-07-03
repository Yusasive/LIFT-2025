import { APIGatewayProxyEventV2 } from "aws-lambda";
import { UserService } from "../services/UserService";
import { autoInjectable, inject } from "tsyringe";

@autoInjectable()
export class UserController {
    constructor(
        @inject("UserService") private userService: UserService,
    ) {}

    async handleUser(event: APIGatewayProxyEventV2) {
        const httpMethod = event.requestContext.http.method;
        const path = event.requestContext.http.path;

        switch(true) {
            case httpMethod === 'POST' && path === '/signup':
                return await this.userService.CreateUser(event);
            
            case httpMethod === 'POST' && path === '/login':
                return await this.userService.UserLogin(event);

            case httpMethod === 'PATCH' && path === '/edit':
                return await this.userService.EditUser(event);

            case httpMethod === 'PATCH' && path === '/status':
                return await this.userService.UpdateUserStatus(event);
            
            case httpMethod === 'POST' && path === '/client/register':
                return await this.userService.ClientRegister(event);
            
            case httpMethod === 'POST' && path === '/client/login':
                return await this.userService.ClientLogin(event);
            
            case httpMethod === 'POST' && path === '/profile':
                return await this.userService.CreateProfile(event);
            
            case httpMethod === 'GET' && path === '/profile':
                return await this.userService.GetProfile(event);
            
            case httpMethod === 'PATCH' && path === '/profile':
                return await this.userService.EditProfile(event);

            case httpMethod === 'GET' && path === '/users':
                return await this.userService.GetUsers(event);

            case httpMethod === 'DELETE' && path.startsWith('/users/'):
                return await this.userService.DeleteUser(event);

            case httpMethod === 'POST' && path === '/logout':
                return await this.userService.UserLogout(event);

            case httpMethod === 'POST' && path === '/profile/address':
                return await this.userService.AddAddress(event);
            
            case httpMethod === 'PATCH' && path.startsWith('/profile/address/'):
                if (path.endsWith('/primary')) {
                    return await this.userService.SetPrimaryAddress(event);
                }
                return await this.userService.UpdateAddress(event);
            
            case httpMethod === 'DELETE' && path.startsWith('/profile/address/'):
                return await this.userService.DeleteAddress(event);

            case httpMethod === 'POST' && path === '/company-reps':
                return await this.userService.AddCompanyRep(event);
            
            case httpMethod === 'GET' && path === '/company-reps':
                return await this.userService.GetCompanyReps(event);
            
            case httpMethod === 'GET' && path.startsWith('/company-reps/'):
                return await this.userService.GetCompanyRepById(event);
            
            case httpMethod === 'DELETE' && path.startsWith('/company-reps/'):
                return await this.userService.DeleteCompanyRep(event);
            
            case httpMethod === 'PATCH' && path.startsWith('/company-reps/'):
                return await this.userService.UpdateCompanyRep(event);

            case httpMethod === 'POST' && path === '/upload/image':
                return await this.userService.UploadImage(event);
            
            case httpMethod === 'DELETE' && path === '/upload/delete':
                return await this.userService.DeleteImage(event);

            default:
                return await this.userService.ResponseWithError(event);
        }
    }
} 