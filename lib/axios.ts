import axios from 'axios';
import { NextResponse } from 'next/server';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor - Add auth token and language
axiosInstance.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Get current locale from URL path or fallback
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const locale = pathname.split('/')[1];
      const supportedLocales = ['ar', 'en'];
      
      config.headers['Accept-language'] = supportedLocales.includes(locale) ? locale : 'ar';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    if (error.response?.status === 403) {
      window.location.href = '/403';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;