import axiosInstance from "@/lib/axios";

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  gender: 'male' | 'female';
  birth_date: string;
  plan_id?: number;
  plan_name?: string;
  plan_price?: number;
  plan_currency?: string;
  image?: string;
  status: string;
  created_at: string;
  join_date: string;
  total_sessions: number;
  attended_sessions: number;
  remaining_sessions: number;
  teacher_name?: string;
  teacher_id?: number;
  total_homework?: number;
  pending_homework?: number;
  parents?: Parent[];
  active_subscription?: {
    sessions_remaining: number;
    total_sessions: number;
    start_date: string;
    end_date: string;
  };
}

export interface Parent {
  id?: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  country_code: string;
}

export interface CreateStudentData {
  name: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
  gender: 'male' | 'female';
  birth_date: string;
  plan_id?: number;
  image?: string;
  parents?: Parent[];
}

export interface UpdateStudentData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  country_code?: string;
  gender?: 'male' | 'female';
  birth_date?: string;
  plan_id?: number;
  image?: string;
  status?: string;
}

export interface Plan {
  id: number;
  name: string;
  price: number;
  currency: string;
  sessions_count: number;
}

export const studentsService = {
  getAll: (params?: { search?: string; status?: string; plan_id?: number }) =>
    axiosInstance.get('/students', { params }),
  getById: (id: number) => axiosInstance.get(`/students/${id}`),
  create: (data: CreateStudentData) => axiosInstance.post('/students', data),
  update: (id: number, data: UpdateStudentData) =>
    axiosInstance.put(`/students/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/students/${id}`),
};

export const plansService = {
  getAll: () => axiosInstance.get('/plans'),
  getById: (id: number) => axiosInstance.get(`/plans/${id}`),
};

export const subscriptionsService = {
  getAll: () => axiosInstance.get('/subscriptions'),
};
