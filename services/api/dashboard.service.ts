/**
 * Dashboard Service
 */

import api from '@/lib/axios';
import type { ApiResponse, DashboardStats, StudentDashboardStats, TeacherDashboardStats } from './types';

export const dashboardService = {
  /**
   * Get dashboard statistics
   */
  getStats: () => 
    api.get<ApiResponse<DashboardStats>>('/dashboard'),

  /**
   * Get teacher dashboard
   */
  getTeacherDashboard: (teacherId?: number) => 
    api.get<ApiResponse<TeacherDashboardStats>>('/teacher/dashboard', { params: { teacher_id: teacherId } }),

  /**
   * Get parent dashboard
   */
  getParentDashboard: (parentId: number) => 
    api.get<ApiResponse>('/parent/dashboard', { params: { parent_id: parentId } }),

  /**
   * Get student dashboard
   */
  getStudentDashboard: (studentId?: number) => 
    api.get<ApiResponse<StudentDashboardStats>>('/student/dashboard', { params: { student_id: studentId } }),
};

export default dashboardService;
