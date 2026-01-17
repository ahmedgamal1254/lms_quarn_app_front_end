'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, getRedirectPath } from '@/lib/auth';
import { useTranslations } from 'next-intl';

/**
 * Root Page - Redirects to appropriate page based on authentication status
 */
export default function HomePage() {
  const router = useRouter();
  const tCommon = useTranslations('Common');

  useEffect(() => {
    // Check if user is authenticated
    if (isAuthenticated()) {
      // User is logged in, redirect to their dashboard
      const user = getUser();
      if (user) {
        const redirectPath = getRedirectPath(user.role);
        router.push(redirectPath);
      } else {
        router.push('/dashboard');
      }
    } else {
      // User is not logged in, redirect to login
      router.push('/login');
    }
  }, [router]);

  // Show loading state while redirecting
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
      {tCommon('loading')}
    </div>
  );
}
