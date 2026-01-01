/**
 * Teachers Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Teacher, 
  CreateTeacherRequest, 
  UpdateTeacherRequest 
} from './types';

export const teachersService = {
  /**
   * Get all teachers
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Teacher>>('/teachers', { params }),

  /**
   * Get teacher by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Teacher>>(`/teachers/${id}`),

  /**
   * Create new teacher
   */
  create: (data: CreateTeacherRequest) => 
    api.post<ApiResponse<Teacher>>('/teachers', data),

  /**
   * Update teacher
   */
  update: (id: number, data: UpdateTeacherRequest) => 
    api.put<ApiResponse<Teacher>>(`/teachers/${id}`, data),

  /**
   * Delete teacher
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/teachers/${id}`),

  /**
   * Get teachers statistics
   */
  getStats: () => 
    api.get<ApiResponse>('/teachers/stats'),
};

export default teachersService;
