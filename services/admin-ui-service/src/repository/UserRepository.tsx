import axios from 'axios';
import { USER_BASE_URL } from '../common/TextStrings';
import { User, UserType } from '@/types/user.type';
import { Response } from '@/types/response.type';

export interface CreateUserRequest {
  email: string;
  phone: string;
  user_type: UserType;
  password: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: string;
  category: string;
  _id: string;
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

  async login(request: LoginRequest): Promise<Response<LoginResponse>> {
    try {
      const response = await this.axiosInstance.post<Response<LoginResponse>>(
        '/login',
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

  async logout(): Promise<void> {
    try {
      await this.axiosInstance.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('user');
    }
  }

  async getUsers(): Promise<Response<User[]>> {
    try {
      const response = await this.axiosInstance.get<Response<User[]>>('/users');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch users');
      }
      throw error;
    }
  }

  async createUser(user: CreateUserRequest): Promise<void> {
    try {
      await this.axiosInstance.post('/signup', user);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(userData: Partial<User>): Promise<void> {
    try {
      await this.axiosInstance.patch(`/edit`, userData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update user');
      }
      throw error;
    }
  }

  async getUserProfile(): Promise<Response<User>> {
    try {
      const response = await this.axiosInstance.get<Response<User>>('/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
      }
      throw error;
    }
  }

  async deleteteUser(id: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/users/${id}`);
    } catch (error) {
      throw error;
    }
  }
}
