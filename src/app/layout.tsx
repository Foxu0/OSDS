import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'Paperless Event & E-Certificate System | URS Cainta Campus',
  description: 'Automated Event Check-in, QR Attendance, Student Recognition, and E-Certificate Verification System for University of Rizal System – Cainta Campus.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
