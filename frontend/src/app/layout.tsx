import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';

export const metadata: Metadata = {
  title: 'HOSTELSPHERE | One Hostel. One Platform.',
  description: 'University Hostel Management System - Real-time QR Verification & Operations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060B12] text-[#F3EFE6] antialiased min-h-screen selection:bg-[#FF6B2B] selection:text-white">
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
