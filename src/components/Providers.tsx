'use client';

import { FitFunProvider } from '@/context/FitFunContext';
import { DevTools } from '@/components/DevTools';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <FitFunProvider>
            {children}
            <DevTools />
        </FitFunProvider>
    );
}
