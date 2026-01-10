/**
 * Authentication Utilities
 * Handles token management and authentication checks
 */


export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    phone?: string;
    image?: string;
    Permissions?: []
}

export interface AuthData {
    token: string;
    user: User;
    expiresAt: number;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const EXPIRES_KEY = 'token_expires_at';

/**
 * Save authentication data to localStorage
 */
export function saveAuth(token: string, user: User): void {
    if (typeof window === 'undefined') return;

    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(EXPIRES_KEY, expiresAt.toString());
}

/**
 * Get authentication token
 */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get current user
 */
export function getUser(): User | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated and token is valid
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = getToken();
    const expiresAt = localStorage.getItem(EXPIRES_KEY);

    if (!token || !expiresAt) return false;

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    // Check if token has expired
    if (now >= expiryTime) {
        logout();
        return false;
    }

    return true;
}

/**
 * Logout user and clear all auth data
 */
export function logout(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRES_KEY);
}

/**
 * Get time remaining until token expires (in milliseconds)
 */
export function getTimeUntilExpiry(): number {
    if (typeof window === 'undefined') return 0;

    const expiresAt = localStorage.getItem(EXPIRES_KEY);
    if (!expiresAt) return 0;

    const expiryTime = parseInt(expiresAt, 10);
    const now = Date.now();

    return Math.max(0, expiryTime - now);
}

/**
 * Check if user has specific role
 */
export function hasRole(role: User['role']): boolean {
    const user = getUser();
    return user?.role === role;
}

/**
 * Get redirect path based on user role
 */
export function getRedirectPath(role: User['role']): string {
    switch (role) {
        case 'admin':
            return '/dashboard';
        case 'teacher':
            return '/teacher/dashboard';
        case 'student':
            return '/student/dashboard';
        case 'parent':
            return '/parent/dashboard';
        default:
            return '/dashboard';
    }
}
