'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Trophy } from 'lucide-react';
import clsx from 'clsx';

export const Navigation = () => {
    const pathname = usePathname();

    const NAV_ITEMS = [
        { label: 'Home', href: '/home', icon: Home },
        { label: 'Workouts', href: '/workouts', icon: Dumbbell },
        { label: 'Progress', href: '/progress', icon: Trophy },
    ];

    const hiddenRoutes = ['/', '/onboarding'];
    const isWorkoutActive = pathname.startsWith('/workout/');
    const isAdmin = pathname.startsWith('/admin');
    if (hiddenRoutes.includes(pathname) || isWorkoutActive || isAdmin) return null;

    return (
        <nav className="mt-auto bg-white border-t border-gray-100 shrink-0">
            <div className="flex justify-around items-center h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center w-full h-full transition-all duration-200 group relative",
                                isActive ? "text-brand-600" : "text-gray-400 hover:text-brand-500 hover:bg-brand-50/50"
                            )}
                        >
                            <div className={clsx("transition-transform duration-200", isActive && "scale-110")}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span className={clsx("text-xs mt-1 font-medium transition-colors", isActive ? "text-brand-700" : "hover:text-brand-600")}>
                                {item.label}
                            </span>
                            {isActive && (
                                <div className="absolute top-0 w-8 h-1 rounded-b-lg bg-brand-500" />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
