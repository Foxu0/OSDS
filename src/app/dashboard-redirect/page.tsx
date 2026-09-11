'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && session?.user) {
      const role = (session.user as any).role || 'OFFICER';
      if (role === 'ADMIN') {
        router.replace('/admin');
      } else {
        router.replace('/officer');
      }
    }
  }, [session, status, router]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', color: '#0F172A' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid #E2E8F0',
          borderTopColor: '#2563EB',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px auto',
        }} />
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
          Loading Staff Workspace...
        </h2>
        <p style={{ color: '#64748B', fontSize: '14px' }}>Redirecting to your URS Cainta portal dashboard.</p>
      </div>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
