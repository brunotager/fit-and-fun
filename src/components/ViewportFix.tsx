'use client';
import { useEffect } from 'react';

export function ViewportFix() {
    useEffect(() => {
        if (!window.visualViewport) return;
        
        const setHeight = () => {
            const vv = window.visualViewport;
            if (vv) {
                document.documentElement.style.setProperty('--vv-height', `${vv.height}px`);
                // Also adjust for the top offset if zoomed
                document.documentElement.style.setProperty('--vv-offset-top', `${vv.offsetTop}px`);
            }
        };

        window.visualViewport.addEventListener('resize', setHeight);
        window.visualViewport.addEventListener('scroll', setHeight);
        setHeight(); // init

        return () => {
            window.visualViewport?.removeEventListener('resize', setHeight);
            window.visualViewport?.removeEventListener('scroll', setHeight);
        };
    }, []);

    return null;
}
