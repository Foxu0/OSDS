import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export const metadata = {
  title: 'Student Dashboard | Paperless Campus – URS Cainta',
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
