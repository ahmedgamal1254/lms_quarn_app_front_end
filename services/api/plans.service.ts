/**
 * Plans Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Plan, 
  CreatePlanRequest, 
  UpdatePlanRequest 
} from './types';

export const plansService = {
  /**
   * Get all plans
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Plan>>('/plans', { params }),

  /**
   * Get plan by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Plan>>(`/plans/${id}`),

  /**
   * Create new plan
   */
  create: (data: CreatePlanRequest) => 
    api.post<ApiResponse<Plan>>('/plans', data),

  /**
   * Update plan
   */
  update: (id: number, data: UpdatePlanRequest) => 
    api.put<ApiResponse<Plan>>(`/plans/${id}`, data),

  /**
   * Delete plan
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/plans/${id}`),
};

export default plansService;
