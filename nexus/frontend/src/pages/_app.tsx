import '@/styles/globals.css';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/verify-email', '/auth/reset-password'];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('auth_token');
    const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname);

    if (!token && !isPublicRoute) {
      router.push('/auth/login');
    } else if (token && router.pathname === '/auth/login') {
      router.push('/');
    }
  }, [router.pathname, router]);

  return (
    <>
      <Head>
        <title>Nexus - Digital Grimoire</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Epilogue:ital,wght@0,400;0,600;0,800;0,900;1,400;1,800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}