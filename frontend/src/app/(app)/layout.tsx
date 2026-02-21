import { Navigation } from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Navigation />
            <main style={{ paddingTop: '80px' }}>
                {children}
            </main>
        </>
    );
}

