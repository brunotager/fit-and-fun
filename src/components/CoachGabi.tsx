'use client';

import React from 'react';
import Image from 'next/image';
import { useFitFun } from '@/context/FitFunContext';
import { motion } from 'framer-motion';

type CoachVariant = 'welcome' | 'celebrate' | 'motivate' | 'comfort' | 'neutral';

interface CoachGabiProps {
    variant?: CoachVariant;
    customMessage?: string;
    className?: string;
    forceState?: boolean; // If true, ignores context state for message logic
}

export const CoachGabi: React.FC<CoachGabiProps> = ({
    variant = 'neutral',
    customMessage,
    className = '',
    forceState = false
}) => {
    const { progress, logs } = useFitFun();

    // Determine Image
    let imageSrc = '/gabi-wave-right-v2.png'; // Default
    if (variant === 'celebrate') imageSrc = '/gabi-celebrate-v2.png';
    if (variant === 'welcome' || variant === 'neutral') imageSrc = '/gabi-wave-left-v2.png';
    if (variant === 'motivate') imageSrc = '/gabi-wave-right-v2.png';
    if (variant === 'comfort') imageSrc = '/gabi-wave-left-v2.png';

    // Determine Message
    let message = customMessage;

    if (!message && !forceState) {
        const { currentStreak, lastWorkoutDate } = progress;
        const isFirstTime = logs.length === 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Logic
        if (variant === 'celebrate') {
            message = "You showed up. That’s the win.";
        } else if (isFirstTime) {
            message = "Start small. Consistency beats intensity.";
            imageSrc = '/gabi-wave-left-v2.png';
        } else if (currentStreak >= 2) {
            message = `Day ${currentStreak}. You’re building something real.`;
            imageSrc = '/gabi-wave-right-v2.png';
        } else if (lastWorkoutDate && lastWorkoutDate < yesterdayStr) {
            // Streak broken
            message = "No guilt. Just restart. One workout today.";
            imageSrc = '/gabi-wave-left-v2.png';
        } else {
            // Default / Neutral day
            message = "Ready for a little movement today?";
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center text-center p-6 ${className}`}
        >
            <div className="relative w-[339px] h-[452px] max-w-full mb-4 drop-shadow-lg">
                <Image
                    src={imageSrc}
                    alt="Coach Gabi"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <div className="bg-white border-2 border-brand-100 rounded-2xl p-4 shadow-sm relative max-w-xs">
                {/* Speech bubble trial */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-brand-100 transform rotate-45 z-10"></div>
                <p className="text-brand-600 font-medium text-lg leading-relaxed">
                    &ldquo;{message}&rdquo;
                </p>
            </div>
        </motion.div>
    );
};
