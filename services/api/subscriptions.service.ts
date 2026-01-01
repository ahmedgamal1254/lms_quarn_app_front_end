/**
 * Subscriptions Service
 */

import api from '@/lib/axios';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  Subscription, 
  CreateSubscriptionRequest, 
  UpdateSubscriptionRequest 
} from './types';

export const subscriptionsService = {
  /**
   * Get all subscriptions
   */
  getAll: (params?: Record<string, unknown>) => 
    api.get<PaginatedResponse<Subscription>>('/subscriptions', { params }),

  /**
   * Get subscription by ID
   */
  getById: (id: number) => 
    api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`),

  /**
   * Create new subscription
   */
  create: (data: CreateSubscriptionRequest) => 
    api.post<ApiResponse<Subscription>>('/subscriptions', data),

  /**
   * Update subscription
   */
  update: (id: number, data: UpdateSubscriptionRequest) => 
    api.put<ApiResponse<Subscription>>(`/subscriptions/${id}`, data),

  /**
   * Delete subscription
   */
  delete: (id: number) => 
    api.delete<ApiResponse>(`/subscriptions/${id}`),
};

export default subscriptionsService;
