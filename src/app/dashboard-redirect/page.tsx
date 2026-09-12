'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.replace('/login');
      return;
    }

    const role = (session.user as any)?.role;

    switch (role) {
      case 'ADMIN':
        router.replace('/admin');
        break;
      case 'OSDS_OFFICER':
        router.replace('/osds');
        break;
      case 'ORG_OFFICER':
        router.replace('/org-officer');
        break;
      case 'STUDENT':
        router.replace('/dashboard');
        break;
      case 'OFFICER':
        // Legacy role — use existing officer dashboard
        router.replace('/officer');
        break;
      default:
        router.replace('/login');
    }
  }, [session, status, router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#F8FAFC'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#2563EB',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '500' }}>
          Redirecting to your workspace...
        </p>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
