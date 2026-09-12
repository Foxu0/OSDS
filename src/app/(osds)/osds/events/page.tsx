'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// OSDS All Events view reuses main OSDS page with 'all' tab
export default function OSDSAllEventsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/osds?tab=all'); }, [router]);
  return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
