/**
 * Sessions Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Session, 
  CreateSessionRequest, 
  UpdateSessionRequest 
} from './types';

export const sessionsService = {
  /**
   * Get all sessions
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Session>>('/sessions', { params }),

  /**
   * Get session by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Session>>(`/sessions/${id}`),

  /**
   * Create new session
   */
  create: (data: CreateSessionRequest) => 
    api.post<ApiResponse<Session>>('/sessions', data),

  /**
   * Create multiple sessions at once
   */
  createBulk: (data: CreateSessionRequest[]) => 
    api.post<ApiResponse<Session[]>>('/sessions/bulk', data),

  /**
   * Update session
   */
  update: (id: number, data: UpdateSessionRequest) => 
    api.put<ApiResponse<Session>>(`/sessions/${id}`, data),

  /**
   * Delete session
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/sessions/${id}`),

  /**
   * Get sessions statistics
   */
  getStats: () => 
    api.get<ApiResponse>('/sessions/stats'),
};

export default sessionsService;
