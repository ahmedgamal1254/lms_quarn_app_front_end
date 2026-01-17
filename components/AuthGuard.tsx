'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '@/lib/auth';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * Authentication Guard Component
 * Protects routes and redirects unauthenticated users to login
 */
export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Public routes that don't require authentication
        const publicRoutes = ['/login', '/register/student'];
        // Remove locale prefix (e.g. /ar/login -> /login)
        const pathnameWithoutLocale = pathname.replace(/^\/(ar|en)/, '') || '/';
        const isPublicRoute = publicRoutes.some(route => pathnameWithoutLocale.startsWith(route));

        // If it's a public route, allow access
        if (isPublicRoute) {
            setIsChecking(false);
            return;
        }

        // Check authentication
        const authenticated = isAuthenticated();

        if (!authenticated) {
            // Not authenticated, redirect to login
            const currentLocale = pathname.split('/')[1];
            const locale = (['ar', 'en'].includes(currentLocale)) ? currentLocale : 'ar';
            router.push(`/${locale}/login`);
            return;
        }

        // User is authenticated
        setIsChecking(false);

        // Set up token expiration check
        const checkInterval = setInterval(() => {
            if (!isAuthenticated()) {
                // Token expired, logout and redirect
                logout();
                const currentLocale = pathname.split('/')[1];
                const locale = (['ar', 'en'].includes(currentLocale)) ? currentLocale : 'ar';
                router.push(`/${locale}/login`);
            }
        }, 60000); // Check every minute

        return () => clearInterval(checkInterval);
    }, [pathname, router]);

    // Show loading state while checking authentication
    if (isChecking) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.25rem'
            }}>
                جاري التحميل...
            </div>
        );
    }

    return <>{children}</>;
}
