/**
 * Subjects Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Subject, 
  CreateSubjectRequest, 
  UpdateSubjectRequest 
} from './types';

export const subjectsService = {
  /**
   * Get all subjects
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Subject>>('/subjects', { params }),

  /**
   * Get subject by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Subject>>(`/subjects/${id}`),

  /**
   * Create new subject
   */
  create: (data: CreateSubjectRequest) => 
    api.post<ApiResponse<Subject>>('/subjects', data),

  /**
   * Update subject
   */
  update: (id: number, data: UpdateSubjectRequest) => 
    api.put<ApiResponse<Subject>>(`/subjects/${id}`, data),

  /**
   * Delete subject
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/subjects/${id}`),
};

export default subjectsService;
