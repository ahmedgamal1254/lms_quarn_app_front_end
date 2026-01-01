/**
 * Homework Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Homework, 
  CreateHomeworkRequest, 
  UpdateHomeworkRequest 
} from './types';

export const homeworkService = {
  /**
   * Get all homework
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Homework>>('/homework', { params }),

  /**
   * Get homework by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Homework>>(`/homework/${id}`),

  /**
   * Create new homework
   */
  create: (data: CreateHomeworkRequest) => 
    api.post<ApiResponse<Homework>>('/homework', data),

  /**
   * Update homework
   */
  update: (id: number, data: UpdateHomeworkRequest) => 
    api.put<ApiResponse<Homework>>(`/homework/${id}`, data),

  /**
   * Delete homework
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/homework/${id}`),
};

export default homeworkService;
