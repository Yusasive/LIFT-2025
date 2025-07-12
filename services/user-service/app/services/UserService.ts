import { APIGatewayProxyEventV2 } from "aws-lambda";
import { SuccessResponse, ErrorResponse } from "../utility/response";
import { UserRepository } from "../repository/userRepository";
import { autoInjectable, inject } from "tsyringe";
import { instanceToPlain, plainToClass } from "class-transformer";
import { SignupInput } from "../models/dto/SignupInput";
import { AppValidationError } from "../utility/errors";
import { GetSalt, GetHashedPassword, ValidatePassword } from "../utility/password";
import { AuthServiceClient } from "../clients/authServiceClient";
import { LoginInput } from "../models/dto/LoginInput";
import { UserType } from "../models/UserType";
import { UserResponse } from "../models/dto/UserResponse";
import { BasicProfileInput, ProfileInput } from "../models/dto/ProfileInput";
import { Exhibitor, SuperAdmin, Organizer, OrganizerStaff } from "../models/entities/User.entity";
import { validate } from "class-validator";
import { UpdateUserStatusInput } from "../models/dto/UpdateUserStatusInput";
import { IsNull } from "typeorm";
import { AddressInput } from "../models/dto/AddressInput";
import { CompanyRep } from "../models/entities/CompanyRep.entity";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";


@autoInjectable()
export class UserService {
  constructor(@inject("UserRepository") private userRepository: UserRepository) {}

  async ResponseWithError(event: APIGatewayProxyEventV2) {
    return ErrorResponse(404, "requested method is not supported!");
  }

  async CreateUser(event: APIGatewayProxyEventV2) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(SignupInput, body);
      const validationError = await validate(input);

      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      // Ensure user_type is properly set from the enum
      if (!Object.values(UserType).includes(body.user_type)) {
        return ErrorResponse(400, "Invalid user type provided.");
      }
      input.user_type = body.user_type as UserType;

      const salt = await GetSalt();
      const hashedPassword = await GetHashedPassword(input.password, salt);

      const roleResult = await AuthServiceClient.getRoleByName(input.user_type);
      console.log(roleResult);
      if (!roleResult.success || !roleResult.data) {
        return ErrorResponse(400, "Invalid user type");
      }

      const user = await this.userRepository.createUser({
        email: input.email,
        password: hashedPassword,
        salt,
        phone: input.phone,
        user_type: input.user_type,
      });

      if (!user) {
        throw new Error("User creation failed!");
      }

      const token = await AuthServiceClient.getToken({
        user_id: user.user_id,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        role_id: roleResult.data.id
      });

      if (!token.success) {
        throw new Error(token.error);
      }

      return SuccessResponse({
        token: token.data?.token,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
        _id: user.user_id
      });
    } catch (error) {
      console.log(error);
      if (error instanceof AppValidationError) {
        return ErrorResponse(400, error.validationErrors);
      }
      return ErrorResponse(500, error);
    }
  }

  async UserLogin(event: APIGatewayProxyEventV2) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(LoginInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }
      const data = await this.userRepository.findAccount(input.email);
      if (!data) {
        return ErrorResponse(400, "Invalid email or password!");
      }

      if (data.user_type === UserType.Attendee || data.user_type === UserType.Exhibitor) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const verified = await ValidatePassword(
        input.password,
        data.password,
        data.salt
      );
      if (!verified) {
        return ErrorResponse(400, "Invalid email or password!");
      }

      const roleResult = await AuthServiceClient.getRoleByName(data.user_type);
      if (!roleResult.success || !roleResult.data) {
        return ErrorResponse(400, "Invalid user type");
      }

      const tokenResponse = await AuthServiceClient.getToken({
        user_id: data.user_id,
        email: data.email,
        phone: data.phone,
        user_type: data.user_type,
        role_id: roleResult.data.id
      });

      const response: UserResponse = {
        _id: data.user_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        userType: data.user_type,
      };

      if (tokenResponse.data.cookie) {
        const successResponse = SuccessResponse(response);
        return {
          ...successResponse,
          cookies: [`${tokenResponse.data.cookie.name}=${tokenResponse.data.cookie.value}; ${Object.entries(tokenResponse.data.cookie.options)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ')}`]
        };
      }
      return ErrorResponse(400, "Unauthorized!");
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async CreateProfile(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "authentication failed!");

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(BasicProfileInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      if (!Object.values(UserType).includes(body.user_type)) {
        return ErrorResponse(400, "Invalid user type provided.");
      }
      const requestedUserType = body.user_type as UserType;

      if (requestedUserType === UserType.Exhibitor && !input.company && payload.company == IsNull) {
        return ErrorResponse(400, "Company name is required for exhibitor accounts.");
      }

      if (requestedUserType === UserType.Exhibitor &&input.booth_preference && input.booth_type) {
        return ErrorResponse(400, "Booth preference and booth type are required for exhibitor accounts.");
      }
      
      const data = await this.userRepository.findAccount(input.email, requestedUserType);

      const user = await this.userRepository.createProfile(
        payload.user_id,
        {
          first_name: input.firstName,
          last_name: input.lastName,
          user_type: data.user_type,  
          email: input.email,
          phone: input.phone,
          company: input.company,
          booth_preference: input.booth_preference,
          booth_type: input.booth_type,
          address: {
            address_line1: input.address,
            address_line2: input.address_line2 || '',
            city: input.city,
            state: input.state,
            country: input.country,
            user_id: payload.user_id.toString(),
            is_primary: true
          },
        }
      );

      const response : UserResponse = {
        _id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        userType: user.user_type,
        address: user.address?.map(addr => ({
          id: addr.id,
          address_line1: addr.address_line1,
          address_line2: addr.address_line2,
          city: addr.city,
          state: addr.state,
          is_primary: addr.is_primary,
          post_code: addr.post_code,
          country: addr.country
        })),
        profilePic: user.profile_pic,
        paymentId: user.payment_id,
        stripeId: user.stripe_id,
        verified: user.verified
      }

      if (user.user_type === UserType.Exhibitor) {
        const exhibitor = user as Exhibitor;
        response.company = exhibitor.company;
        response.status = exhibitor.status;
        response.local = exhibitor.local;
        response.boothPreference = exhibitor.booth_preference;
        response.boothType = exhibitor.booth_type;
      }

      return SuccessResponse(response);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async GetProfile(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "authentication failed!");
  
      // Check if user has permission to read profile
      const permissionResult = await AuthServiceClient.checkPermission(
        'read:user',
        'user-service',
        payload
      );
  
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }
  
      const user = await this.userRepository.getUserProfile(payload.user_id);
      if (!user) {
        return ErrorResponse(404, "user not found!");
      }
  
      // Narrow type based on user_type
      const response: UserResponse = {
        _id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        userType: user.user_type,
        address: user.address?.map(addr => ({
          id: addr.id,
          address_line1: addr.address_line1,
          address_line2: addr.address_line2,
          city: addr.city,
          state: addr.state,
          country: addr.country,
          is_primary: addr.is_primary,
          post_code: addr.post_code
        })),
        profilePic: user.profile_pic,
        paymentId: user.payment_id,
        stripeId: user.stripe_id,
        verified: user.verified
      };
  
      // Optional: Include subclass-specific fields
      switch (user.user_type) {
        case UserType.Exhibitor:
          response.company = (user as Exhibitor).company;
          response.status = (user as Exhibitor).status;
          response.local = (user as Exhibitor).local;
          break;
  
        case UserType.Super_Admin:
          const superAdmin = user as SuperAdmin;
          response.staffId = superAdmin.staff_id;
          response.ticketNumber = superAdmin.ticket_number;
          response.qrCode = superAdmin.qr_code;
          break;
  
        case UserType.Organizer:
          const organizer = user as Organizer;
          response.staffId = organizer.staff_id;
          response.ticketNumber = organizer.ticket_number;
          response.qrCode = organizer.qr_code;
          break;
  
        case UserType.Organizer_Staff:
          const organizerStaff = user as OrganizerStaff;
          response.staffId = organizerStaff.staff_id;
          response.ticketNumber = organizerStaff.ticket_number;
          response.qrCode = organizerStaff.qr_code;
          break;
  
        default:
          break;
      }
  
      return SuccessResponse(response);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }
  

  async EditProfile(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");
  
      // Permission check
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
  
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }
  
      // Parse and validate input
      const body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body;
      const input = plainToClass(ProfileInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      // Load user using the ID from JWT payload
      const user = await this.userRepository.getUserProfile(payload.user_id);
      if (!user) return ErrorResponse(404, "User not found");
  
      // Build updates payload
      const updates: Partial<{ first_name: string; last_name: string; company: string; status: string }> = {};
      
      // Only update fields that are provided in the request
      if (input.first_name !== undefined) updates.first_name = input.first_name;
      if (input.last_name !== undefined) updates.last_name = input.last_name;
      if (input.company !== undefined) updates.company = input.company;
      if (input.status !== undefined) updates.status = input.status;
  
      // Apply update if there are any changes
      if (Object.keys(updates).length > 0) {
        await this.userRepository.updateUser(user.user_id, updates);
        return SuccessResponse({ message: "Profile updated successfully!" });
      }
  
      return SuccessResponse({ message: "No changes to update." });
    } catch (error) {
      console.error("EditProfile error:", error);
      return ErrorResponse(500, "An unexpected error occurred.");
    }
  }


  async GetUsers(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "authentication failed!");

      // Check if user has permission to list all users
      const permissionResult = await AuthServiceClient.checkPermission(
        'read:users',
        'user-service',
        payload
      );

      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      // Get query parameters
      const queryParams = event.queryStringParameters || {};
      const userType = queryParams.type as UserType;

      const users = await this.userRepository.getUsers(userType);
      const transformedUsers = users.map(user => instanceToPlain(user))

      return SuccessResponse(transformedUsers);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async EditUser(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(ProfileInput, body);
      const validationError = await validate(input);

      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      // Check if user has permission to list all users
      const permissionResult = await AuthServiceClient.checkPermission(
        'update:user',
        'user-service',
        payload
      );

      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const user = await this.userRepository.updateUser(body.user_id, input);
      return SuccessResponse({ message: "User updated!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async DeleteUser(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      const userId = event.pathParameters?.id;
      if (!userId) return ErrorResponse(400, "User ID is required");

      const permissionResult = await AuthServiceClient.checkPermission(
        'delete:users',
        'user-service',
        payload
      );

      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      await this.userRepository.deleteUser(Number(userId));
      return SuccessResponse({ message: "User deleted!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async UserLogout(event: APIGatewayProxyEventV2) {
    const isProd = process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'dev';
    const domainPart = isProd && process.env.COOKIE_DOMAIN ? `; Domain=${process.env.COOKIE_DOMAIN}` : '';
    const securePart = isProd ? '; Secure' : '';
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
    try {
      const origin = event.headers.origin || '';
      const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin,
          'Access-Control-Allow-Credentials': 'true'
        },
        cookies: [
          `auth_token=; HttpOnly${securePart}; SameSite=Strict; Path=/; Max-Age=0${domainPart}`
        ],
        body: JSON.stringify({
          success: true,
          message: 'Logged out successfully'
        })
      };
    } catch (error) {
      console.error('Logout error:', error);
      return ErrorResponse(500, error);
    }
  }

  async UpdateUserStatus(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "authentication failed!");

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(UpdateUserStatusInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      const user = await this.userRepository.updateUserStatus(input.user_id, input.is_active);
      return SuccessResponse({ message: "user status updated!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async ClientRegister(event: APIGatewayProxyEventV2) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(SignupInput, body);
      const validationError = await validate(input);

      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      // Validate company name for exhibitors
      if (input.user_type === UserType.Exhibitor) {
        if (!input.company_name || input.company_name.trim() === '') {
          return ErrorResponse(400, "Company name is required for exhibitors");
        }
        if (!input.local || input.local.trim() === '') {
          return ErrorResponse(400, "Local is required for exhibitors");
        }
      }

      const salt = await GetSalt();
      const hashedPassword = await GetHashedPassword(input.password, salt);

      // Check role is customer or exhibitor
      if (input.user_type !== UserType.Attendee && input.user_type !== UserType.Exhibitor) {
        return ErrorResponse(400, "Invalid user type");
      }

      // Check if user already exists
      const userExists = await this.userRepository.checkUserExists(input.email);
      if (userExists) {
        return ErrorResponse(400, "User with this email already exists");
      }

      const roleResult = await AuthServiceClient.getRoleByName(input.user_type);
      if (!roleResult.success || !roleResult.data) {
        return ErrorResponse(400, "Invalid user type");
      }

      const user = await this.userRepository.createUser({
        email: input.email,
        password: hashedPassword,
        salt,
        phone: input.phone,
        user_type: input.user_type,
        company_name: input.company_name,
        local: input.local
      });

      if (!user) {
        throw new Error("User creation failed!");
      }

      const token = await AuthServiceClient.getToken({
        user_id: user.user_id,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        role_id: roleResult.data.id
      });

      if (!token.success) {
        throw new Error(token.error);
      }

      return SuccessResponse({
        token: token.data?.token,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
        _id: user.user_id
      });
    } catch (error) {
      console.log(error);
      if (error instanceof AppValidationError) {
        return ErrorResponse(400, error.validationErrors);
      }
      return ErrorResponse(500, error);
    }
  }

  async ClientLogin(event: APIGatewayProxyEventV2) {
    try {
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(LoginInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      // Get user type from request
      const requestedUserType = body.user_type as UserType;
      if (!Object.values(UserType).includes(requestedUserType)) {
        return ErrorResponse(400, "Invalid user type provided.");
      }
      
      // Find account with email and user type validation
      const user = await this.userRepository.findAccount(input.email, requestedUserType);
      if (!user) {
        return ErrorResponse(400, "Invalid email or password!");
      }
      
      // Verify password
      const verified = await ValidatePassword(
        input.password,
        user.password,
        user.salt
      );
      if (!verified) {
        return ErrorResponse(401, "Invalid email or password!");
      }

      const roleResult = await AuthServiceClient.getRoleByName(user.user_type);
      if (!roleResult.success || !roleResult.data) {
        return ErrorResponse(400, "Invalid user type or role not found!");
      }

      const tokenResponse = await AuthServiceClient.getToken({
        user_id: user.user_id,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type,
        role_id: roleResult.data.id
      });

      const response: UserResponse = {
        _id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        userType: user.user_type,
        address: user.address,
      };

      // Add exhibitor-specific fields if user is an exhibitor
      if (user.user_type === UserType.Exhibitor) {
        const exhibitor = user as Exhibitor;
        response.company = exhibitor.company;
        response.local = exhibitor.local;
        response.boothPreference = exhibitor.booth_preference;
        response.boothType = exhibitor.booth_type;
      }

      // Set cookie in response
      if (tokenResponse.data.cookie) {
        return {
          statusCode: 200,
          body: JSON.stringify(response),
          cookies: [`${tokenResponse.data.cookie.name}=${tokenResponse.data.cookie.value}; ${Object.entries(tokenResponse.data.cookie.options)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ')}`]
        };
      }

      return SuccessResponse(response);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async AddAddress(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // Permission check
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
  
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(AddressInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      const address = await this.userRepository.addAddress(payload.user_id, input);
      return SuccessResponse(address);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async UpdateAddress(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // Permission check
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
      
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(AddressInput, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      if (!event.pathParameters?.address_id) {
        return ErrorResponse(400, "Address ID is required");
      }

      input.address_id = Number(event.pathParameters?.address_id);

      await this.userRepository.updateAddress(payload.user_id, input);
      return SuccessResponse({ message: "Address updated!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async DeleteAddress(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // Permission check
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
      
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const addressId = event.pathParameters?.address_id;
      if (!addressId) return ErrorResponse(400, "Address ID is required");

      await this.userRepository.deleteAddress(payload.user_id, Number(addressId));
      return SuccessResponse({ message: "Address deleted!" });
    } catch (error) {
      return ErrorResponse(500, error);
    }
  }

  async SetPrimaryAddress(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // Permission check
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
      
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const addressId = event.pathParameters?.address_id;
      if (!addressId) return ErrorResponse(400, "Address ID is required");

      await this.userRepository.setPrimaryAddress(payload.user_id, Number(addressId));
      return SuccessResponse({ message: "Address set as primary!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async AddCompanyRep(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // const permissionResult = await AuthServiceClient.checkPermission(
      //   "update:user",
      //   "user-service",
      //   payload
      // );
      
      // if (!permissionResult.success) {
      //   return ErrorResponse(401, "You are not authorized to access this resource!");
      // }

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      console.log("Company Rep Body", body);
      const input = plainToClass(CompanyRep, body);
      const validationError = await validate(input);
      if (validationError.length > 0) {
        throw new AppValidationError(validationError);
      }

      const companyRep = await this.userRepository.addCompanyRep(payload.user_id, input);
      return SuccessResponse(companyRep);

    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async GetCompanyReps(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      
      // const permissionResult = await AuthServiceClient.checkPermission(
      //   "update:user",
      //   "user-service",
      //   payload
      // );
      
      // if (!permissionResult.success) {
      //   return ErrorResponse(401, "You are not authorized to access this resource!");
      // }

      const companyReps = await this.userRepository.getCompanyReps(payload.user_id);
      return SuccessResponse(companyReps);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async DeleteCompanyRep(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

            // const permissionResult = await AuthServiceClient.checkPermission(
      //   "update:user",
      //   "user-service",
      //   payload
      // );
      
      // if (!permissionResult.success) {
      //   return ErrorResponse(401, "You are not authorized to access this resource!");
      // }

      const companyRepId = event.pathParameters?.company_rep_id;
      if (!companyRepId) return ErrorResponse(400, "Company rep ID is required");

      await this.userRepository.deleteCompanyRep(Number(companyRepId));
      return SuccessResponse({ message: "Company rep deleted!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async UpdateCompanyRep(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // const permissionResult = await AuthServiceClient.checkPermission(
      //   "update:user",
      //   "user-service",
      //   payload
      // );
      
      // if (!permissionResult.success) {
      //   return ErrorResponse(401, "You are not authorized to access this resource!");
      // }

      const companyRepId = event.pathParameters?.company_rep_id;
      if (!companyRepId) return ErrorResponse(400, "Company rep ID is required");

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const input = plainToClass(CompanyRep, body);

      await this.userRepository.updateCompanyRep(Number(companyRepId), input);
      return SuccessResponse({ message: "Company rep updated!" });
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async GetCompanyRepById(event: APIGatewayProxyEventV2) {
    try {
      // This is a public endpoint for QR code scanning - no authentication required
      const companyRepId = event.pathParameters?.company_rep_id;
      if (!companyRepId) return ErrorResponse(400, "Company rep ID is required");

      const companyRep = await this.userRepository.getCompanyRepById(Number(companyRepId));
      if (!companyRep) {
        return ErrorResponse(404, "Company representative not found");
      }

      return SuccessResponse(companyRep);
    } catch (error) {
      console.log(error);
      return ErrorResponse(500, error);
    }
  }

  async UploadImage(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // Check if user has permission to upload images
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
      
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      console.log('Upload request headers:', event.headers);
      console.log('Upload request body type:', typeof event.body);

      // Parse JSON body
      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      
      const { file: base64Data, filename, contentType, folder } = body;

      if (!base64Data || !filename || !contentType) {
        console.log('Missing required fields:', { hasFile: !!base64Data, hasFilename: !!filename, hasContentType: !!contentType });
        return ErrorResponse(400, "Missing required fields: file, filename, or contentType");
      }

      console.log('File info:', { filename, contentType, folder: folder || 'uploads', dataLength: base64Data.length });

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(contentType)) {
        console.log('Invalid file type:', contentType);
        return ErrorResponse(400, "Invalid file type. Only images are allowed.");
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const fileSize = Math.ceil((base64Data.length * 3) / 4); // Approximate size
      if (fileSize > maxSize) {
        console.log('File too large:', fileSize);
        return ErrorResponse(400, "File size too large. Maximum size is 5MB.");
      }

      // Generate unique filename
      const fileExtension = filename.split('.').pop() || 'jpg';
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const uploadFolder = folder || 'uploads';
      const key = `media/${uploadFolder}/${uniqueFileName}`;

      console.log('S3 upload params:', { bucketName: process.env.S3_UPLOAD_BUCKET_NAME || 'litf-dev-uploads', key });

      // Upload to S3
      const s3 = new AWS.S3();
      const bucketName = process.env.S3_UPLOAD_BUCKET_NAME || 'litf-dev-uploads';

      const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: Buffer.from(base64Data, 'base64'),
        ContentType: contentType
        // No ACL - bucket will be private
      };

      const uploadResult = await s3.upload(uploadParams).promise();
      const imageUrl = uploadResult.Location;

      if (!process.env.CLOUDFRONT_DOMAIN) {
        return ErrorResponse(400, "CloudFront domain is not configured");
      }

      // Generate CloudFront signed URL
      const cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
      const signedUrl = this.generateSignedUrl(cloudFrontDomain, key);

      console.log('Upload successful:', signedUrl);

      return SuccessResponse({
        url: signedUrl,
        key: key,
        filename: filename
      });

    } catch (error) {
      console.error('Upload error:', error);
      return ErrorResponse(500, "Failed to upload image");
    }
  }

  private generateSignedUrl(domain: string, key: string): string {
    const privateKeyBase64 = process.env.CLOUDFRONT_PRIVATE_KEY || '';
    const keyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID || '';
    const bucketName = process.env.S3_UPLOAD_BUCKET_NAME || 'litf-dev-uploads';
  
    if (!domain || domain === 'your-cloudfront-domain.cloudfront.net' || !privateKeyBase64 || !keyPairId) {
      console.log('CloudFront not fully configured, using S3 URL as fallback');
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    }
  
    try {
      const privateKey = Buffer.from(privateKeyBase64, 'base64').toString('utf-8');
      const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  
      const policy = JSON.stringify({
        Statement: [{
          Resource: `https://${domain}/${key}`,
          Condition: {
            DateLessThan: { 'AWS:EpochTime': expires }
          }
        }]
      });
  
      const signer = crypto.createSign('RSA-SHA256');
      signer.update(policy);
      const signature = signer.sign(privateKey, 'base64');
  
      const urlSafe = (str: string) =>
        str.replace(/\+/g, '-').replace(/=/g, '_').replace(/\//g, '~');
  
      const params = new URLSearchParams({
        'Key-Pair-Id': keyPairId,
        'Signature': urlSafe(signature),
        'Policy': urlSafe(Buffer.from(policy).toString('base64'))
      });
  
      return `https://${domain}/${key}?${params.toString()}`;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return `https://${bucketName}.s3.amazonaws.com/${key}`;
    }
  }

  async DeleteImage(event: APIGatewayProxyEventV2) {
    try {
      const payload = event.requestContext.authorizer?.jwt?.claims;
      if (!payload) return ErrorResponse(403, "Authentication failed!");

      // Check if user has permission to delete images
      const permissionResult = await AuthServiceClient.checkPermission(
        "update:user",
        "user-service",
        payload
      );
      
      if (!permissionResult.success) {
        return ErrorResponse(401, "You are not authorized to access this resource!");
      }

      const body = typeof event.body === 'string' ? JSON.parse(event.body || '{}') : event.body;
      const { url } = body;

      if (!url) {
        return ErrorResponse(400, "Image URL is required");
      }

      // Extract key from S3 URL
      const urlParts = url.split('/');
      const key = urlParts.slice(-2).join('/'); // Get folder/filename

      // Delete from S3
      const s3 = new AWS.S3();
      const bucketName = process.env.S3_UPLOAD_BUCKET_NAME || 'litf-dev-uploads';

      await s3.deleteObject({
        Bucket: bucketName,
        Key: key
      }).promise();

      return SuccessResponse({ message: "Image deleted successfully" });

    } catch (error) {
      console.error('Delete error:', error);
      return ErrorResponse(500, "Failed to delete image");
    }
  }
} 