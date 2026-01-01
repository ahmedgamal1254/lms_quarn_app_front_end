import axiosInstance from '@/lib/axios';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  role: string;
  image?: string;
  status: string;
  created_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
  role: string;
  image?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  country_code?: string;
  role?: string;
  image?: string;
  status?: string;
}

export const usersService = {
  getAll: () => axiosInstance.get('/users'),
  getById: (id: number) => axiosInstance.get(`/users/${id}`),
  create: (data: CreateUserData) => axiosInstance.post('/users', data),
  update: (id: number, data: UpdateUserData) => axiosInstance.put(`/users/${id}`, data),
  delete: (id: number) => axiosInstance.delete(`/users/${id}`),
};