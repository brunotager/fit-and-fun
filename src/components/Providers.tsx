'use client';

import { FitFunProvider } from '@/context/FitFunContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FitFunProvider>
            {children}
        </FitFunProvider>
    );
}
