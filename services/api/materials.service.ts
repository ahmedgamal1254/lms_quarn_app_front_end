import { apiClient } from './index';
import { ApiResponse } from './types';
import {
  EducationalMaterial,
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from './materials.types';

/**
 * Educational Materials API Service
 */

// Get materials (filtered by role)
export const getMaterials = async (params?: {
  status?: string;
  subject_id?: number;
  teacher_id?: number;
  per_page?: number;
  page?: number;
}): Promise<ApiResponse<{
  materials: EducationalMaterial[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}>> => {
  const response = await apiClient.get('/materials', { params });
  return response.data;
};

// Upload new material (Teacher)
export const uploadMaterial = async (data: CreateMaterialRequest): Promise<ApiResponse<{
  material_id: number;
  status: string;
}>> => {
  const formData = new FormData();
  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.subject_id) formData.append('subject_id', data.subject_id.toString());
  formData.append('file', data.file);

  const response = await apiClient.post('/teacher/materials', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Update material (Teacher)
export const updateMaterial = async (
  id: number,
  data: UpdateMaterialRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.put(`/teacher/materials/${id}`, data);
  return response.data;
};

// Delete material
export const deleteMaterial = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete(`/teacher/materials/${id}`);
  return response.data;
};

// Approve material (Admin)
export const approveMaterial = async (id: number): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/materials/${id}/approve`);
  return response.data;
};

// Reject material (Admin)
export const rejectMaterial = async (
  id: number,
  rejection_reason?: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/materials/${id}/reject`, {
    rejection_reason,
  });
  return response.data;
};

// Download material
export const downloadMaterial = async (id: number): Promise<Blob> => {
  const response = await apiClient.get(`/materials/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};
