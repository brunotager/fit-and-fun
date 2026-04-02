'use client';

import { useFitFun } from '@/context/FitFunContext';
import { CoachCard } from '@/components/CoachCard';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
    const { profile, progress } = useFitFun();
    const router = useRouter();

    // Get first initial for avatar
    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] relative overflow-hidden">
            {/* Top Header */}
            <div className="pt-8 px-6 pb-2 flex justify-between items-center z-10">
                {/* Placeholder for Left Spacer to balance avatar */}
                <div className="w-10"></div>

                {/* Logo */}
                <div className="relative w-20 h-20">
                    <Image
                        src="/logo.png"
                        alt="Fit & Fun Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* User Avatar (Settings Link) */}
                <Link href="/settings" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-200 transition-colors">
                    {initial}
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative pb-8 px-6">
                {/* Coach Display (Seamless Mode) */}
                <div className="flex-1 flex items-center justify-center w-full">
                    <CoachCard state={progress} seamless messageOverride="Self-care is not selfish" />
                </div>

                {/* Floating Action Button - Now Centered */}
                <div className="relative z-20 mt-[-30px] mb-10">
                    <button
                        onClick={() => router.push('/workouts')}
                        className="w-24 h-24 rounded-full bg-brand-500 text-white font-black text-xs shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center leading-tight ring-4 ring-white"
                    >
                        <span className="mb-0.5">START</span>
                        <span>WORKOUT</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
