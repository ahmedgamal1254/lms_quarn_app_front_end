/**
 * Exams Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Exam, 
  CreateExamRequest, 
  UpdateExamRequest 
} from './types';

export const examsService = {
  /**
   * Get all exams
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Exam>>('/exams', { params }),

  /**
   * Get exam by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Exam>>(`/exams/${id}`),

  /**
   * Create new exam
   */
  create: (data: CreateExamRequest) => 
    api.post<ApiResponse<Exam>>('/exams', data),

  /**
   * Update exam
   */
  update: (id: number, data: UpdateExamRequest) => 
    api.put<ApiResponse<Exam>>(`/exams/${id}`, data),

  /**
   * Delete exam
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/exams/${id}`),
};

export default examsService;
