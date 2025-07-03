import axios from 'axios';
import { USER_BASE_URL } from '../common/TextStrings';
import { User } from '../types/user.type';
import { Address } from '../types/address.type';
import { CompanyRep } from '../types/companyRep.types';

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export enum UserRole {
  ATTENDEE = 'ATTENDEE',
  EXHIBITOR = 'EXHIBITOR',
  STAFF = 'STAFF'
}

export enum UserRegistrationRole {
  ATTENDEE = 'ATTENDEE',
  EXHIBITOR = 'EXHIBITOR',
}

export interface LoginRequest {
  email: string;
  password: string;
  user_type: UserRole;
  staffId?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  user_type: UserRegistrationRole;
  company_name?: string;
  phone: string;
  local?: string;
  referral_code?: string;
}

export interface CreateUserProfileRequest {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  company?: string;
  user_type: string;
}



export interface RegisterResponse {
  message: string;
  data: {
    _id: number;
    email: string;
    userType: string;
  }
}

export interface AddAddressRequest {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  post_code?: string;
}





export class UserRepository {
  private static instance: UserRepository;
  private baseUrl: string;
  private axiosInstance;
  
  private constructor() {
    if (import.meta.env.VITE_ENVIRONMENT === 'dev') {
      this.baseUrl = import.meta.env.VITE_SERVICE_BASE_URL + '/user';
    } else {
      this.baseUrl = USER_BASE_URL;
    }
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      withCredentials: true
    });
  }

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async login(request: LoginRequest): Promise<User> {
    try {
      const response = await this.axiosInstance.post<User>(
        '/client/login',
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await this.axiosInstance.post<RegisterResponse>(
        '/client/register',
        request
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  }

  async createProfile(request: CreateUserProfileRequest): Promise<{message: string, data: User}> {
    try {
      const response = await this.axiosInstance.post('/profile', request, {
        withCredentials: true
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Profile update failed')
      }
      throw error;
    }
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.get('/profile', {
        withCredentials: true
      });
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Profile update failed')
      }
      throw error;
    }
  }

  async updateUser(updatedUser: Partial<User>): Promise<{ success: boolean; error?: string; data?: User }> {
    try {
      const response = await this.axiosInstance.patch(`/profile/`, updatedUser, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {   
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Profile update failed')
      }
      throw error;
    }
  }


  async addAddress(request: AddAddressRequest): Promise<{ success: boolean; error?: string; data?: Address }> {
    try {
      const response = await this.axiosInstance.post('/profile/address', request, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Address update failed')
      }
      throw error;
    }
  }

  async updateAddress(address_id: string,request: AddAddressRequest): Promise<{ success: boolean; error?: string; data?: User }> {
    try {
      const response = await this.axiosInstance.patch(`/profile/address/${address_id}`, request, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Address update failed')
      }
      throw error;
    }
  }

  async deleteAddress(address_id: string): Promise<{ success: boolean; error?: string; data?: User }> {
    try {
      const response = await this.axiosInstance.delete(`/profile/address/${address_id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Address update failed')
      }
      throw error;
    }
  }

  async setPrimaryAddress(address_id: string): Promise<{ success: boolean; error?: string; data?: User }> {
    try {
      const response = await this.axiosInstance.patch(`/profile/address/${address_id}/primary`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Address update failed')
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/logout', {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  async getCompanyReps(): Promise<ApiResponse<CompanyRep[]>> {
    try {
      const response = await this.axiosInstance.get('/company-reps', {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Server Unavailable')
      }
      throw error;
    }
  }

  async addCompanyRep(request: CompanyRep): Promise<ApiResponse<CompanyRep>> {
    console.log("Company Rep Request", request);
    try {
      const response = await this.axiosInstance.post('/company-reps', request, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Server Unavailable')
      }
      throw error;
    }
  }

  async deleteCompanyRep(id: number): Promise<ApiResponse<CompanyRep>> {
    try {
      const response = await this.axiosInstance.delete(`/company-reps/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Server Unavailable')
      }
      throw error;
    }
  }
  
  async updateCompanyRep(id: number, request: Partial<CompanyRep>): Promise<ApiResponse<CompanyRep>> {
    try {
      const response = await this.axiosInstance.patch(`/company-reps/${id}`, request, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Server Unavailable')
      }
      throw error;
    }
  }

  async getCompanyRepById(id: number): Promise<ApiResponse<CompanyRep>> {
    try {
      const response = await this.axiosInstance.get(`/company-reps/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)){
        throw new Error(error.response?.data.message || 'Server Unavailable')
      }
      throw error;
    }
  }
}
