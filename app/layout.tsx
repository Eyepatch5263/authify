import './globals.css';
import type { Metadata } from 'next';
import { Inria_Sans } from 'next/font/google';
import { UserProvider } from '@auth0/nextjs-auth0/client';


export const metadata: Metadata = {
  title: 'Authify - Multi-Device Session Management',
  description: 'Secure authentication with device session control',
};

const inria = Inria_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-inria',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inria.className}>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
