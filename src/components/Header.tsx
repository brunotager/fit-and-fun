'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';

interface HeaderProps {
    title?: string;
    showLogo?: boolean;
    showBack?: boolean;
    backTo?: string; // specific url to go back to, defaults to router.back()
    onBack?: () => void; // custom back handler
    className?: string;
}

export function Header({ title, showLogo, showBack, backTo, onBack, className = '' }: HeaderProps) {
    const router = useRouter();
    const { profile } = useFitFun();
    const [menuOpen, setMenuOpen] = useState(false);

    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else if (backTo) {
            router.push(backTo);
        } else {
            router.back();
        }
    };

    return (
        <div className={`px-6 pt-2 pb-2 flex justify-between items-center w-full bg-transparent z-40 sticky top-0 ${className}`}>
            {/* Left Slot: Back Button or Spacer */}
            <div className="w-10">
                {showBack && (
                    <button 
                        onClick={handleBack} 
                        className="w-10 h-10 -ml-2 text-stone-600 hover:bg-stone-50 rounded-full transition-colors flex items-center justify-center p-0"
                    >
                        <ChevronLeft size={28} strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {/* Center Slot: Title or Logo */}
            <div className="flex-1 flex justify-center items-center">
                {showLogo ? (
                    <div className="relative w-[100px] h-[70px]">
                        <Image
                            src="/logo.png"
                            alt="Fit & Fun Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                ) : title ? (
                    <h1 className="text-[14px] tracking-[0.1em] font-bold text-stone-900 uppercase">
                        {title}
                    </h1>
                ) : null}
            </div>

            {/* Right Slot: Avatar with Dropdown */}
            <div className="relative w-10 flex justify-end">
                <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 overflow-hidden"
                >
                    {profile.profileImage ? (
                        <Image src={profile.profileImage} alt="Profile" fill className="object-cover" />
                    ) : (
                        initial
                    )}
                </button>

                {menuOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40 cursor-default" 
                            onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg z-50 border border-stone-100 overflow-hidden">
                            <Link 
                                href="/profile" 
                                className="block px-4 py-3 text-stone-700 font-medium hover:bg-stone-50 transition-colors border-b border-stone-50"
                                onClick={() => setMenuOpen(false)}
                            >
                                My Profile
                            </Link>
                            <Link 
                                href="/settings" 
                                className="block px-4 py-3 text-stone-700 font-medium hover:bg-stone-50 transition-colors"
                                onClick={() => setMenuOpen(false)}
                            >
                                Settings
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
