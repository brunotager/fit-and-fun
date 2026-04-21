'use client';

import React, { useState } from 'react';
import { useFitFun } from '@/context/FitFunContext';
import { CoachCard } from '@/components/CoachCard';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';

export default function HomePage() {
    const { profile, progress } = useFitFun();
    const router = useRouter();

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] relative overflow-hidden">
            {/* Top Header */}
            <Header showLogo />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative pb-8 px-6">
                {/* Coach Display (Seamless Mode) */}
                <div className="flex-1 flex items-center justify-center w-full">
                    <CoachCard state={progress} seamless messageOverride="Self-care is not selfish" />
                </div>

                {/* Floating Action Button - Now Centered */}
                <div className="relative z-20 mt-[-30px] mb-8 flex flex-col items-center">
                    <button
                        onClick={() => router.push('/workouts')}
                        className="w-24 h-24 rounded-full bg-brand-500 text-white font-black text-xs shadow-[0_8px_30px_rgb(249,115,22,0.4)] hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center leading-tight ring-4 ring-white mb-3"
                    >
                        <span className="mb-0.5">START</span>
                        <span>WORKOUT</span>
                    </button>
                    
                    <div className="text-[12px] font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-full uppercase tracking-wider text-center">
                        {progress.currentPlanDay > 7 
                            ? "Beta Complete!" 
                            : `Day ${progress.currentPlanDay} of 7 — Keep it going!`}
                    </div>
                </div>
            </div>
        </div>
    );
}
