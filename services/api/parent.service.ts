import { api } from './index';
import { ApiResponse } from './types';
import { ParentDashboardStats, CreateParentRequest } from './types';

/**
 * Parent API Service
 */

// Parent registration
export const parentRegister = async (data: CreateParentRequest): Promise<ApiResponse<{
  token: string;
  user: any;
  parent: any;
}>> => {
  const response = await api.post('/auth/parent-register', data);
  return response.data;
};

// Get parent dashboard
export const getParentDashboard = async (): Promise<ApiResponse<ParentDashboardStats>> => {
  const response = await api.get('/parent/dashboard');
  return response.data;
};

// Get all children
export const getParentChildren = async (): Promise<ApiResponse<any[]>> => {
  const response = await api.get('/parent/children');
  return response.data;
};

// Get child details
export const getChildDetails = async (childId: number): Promise<ApiResponse<any>> => {
  const response = await api.get(`/parent/children/${childId}`);
  return response.data;
};

// Get child's sessions
export const getChildSessions = async (childId: number, params?: {
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<any>> => {
  const response = await api.get(`/parent/children/${childId}/sessions`, { params });
  return response.data;
};

// Get child's homework
export const getChildHomework = async (childId: number, params?: {
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<any>> => {
  const response = await api.get(`/parent/children/${childId}/homework`, { params });
  return response.data;
};

// Get child's exams
export const getChildExams = async (childId: number, params?: {
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<any>> => {
  const response = await api.get(`/parent/children/${childId}/exams`, { params });
  return response.data;
};

// Link a child to parent account
export const linkChild = async (studentId: number): Promise<ApiResponse<null>> => {
  const response = await api.post('/parent/link-child', { student_id: studentId });
  return response.data;
};
