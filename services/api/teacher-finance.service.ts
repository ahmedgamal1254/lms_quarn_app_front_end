import { apiClient } from './index';
import { ApiResponse } from './types';
import { TeacherFinancialReset, ResetTeacherBalanceRequest } from './materials.types';

/**
 * Teacher Finance API Service
 */

// Reset teacher's monthly balance (Admin only)
export const resetTeacherBalance = async (
  teacherId: number,
  data?: ResetTeacherBalanceRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/teachers/${teacherId}/reset-balance`, data);
  return response.data;
};

// Get reset history for a teacher
export const getTeacherResetHistory = async (
  teacherId: number
): Promise<ApiResponse<TeacherFinancialReset[]>> => {
  const response = await apiClient.get(`/teachers/${teacherId}/reset-history`);
  return response.data;
};
