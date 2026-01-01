/**
 * Authentication Service
 */

import api from '@/lib/axios';
import type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest, User } from './types';

export const authService = {
  /**
   * Login user
   */
  login: (data: LoginRequest) => 
    api.post<LoginResponse>('/auth/login', data),

  /**
   * Register new user
   */
  register: (data: RegisterRequest) => 
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data),

  /**
   * Register new student
   */
  studentRegister: (data: RegisterRequest) => 
    api.post<ApiResponse<{ token: string; user: User }>>('/auth/student-register', data),

  /**
   * Verify current token
   */
  verify: () => 
    api.get<ApiResponse<User>>('/auth/verify'),

  /**
   * Logout current user
   */
  logout: () => 
    api.post<ApiResponse>('/auth/logout'),
};

export default authService;
