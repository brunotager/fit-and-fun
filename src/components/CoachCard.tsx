import React from 'react';
import Image from 'next/image';
import { Progress } from '@/context/FitFunContext';

interface CoachCardProps {
    state: Progress;
    seamless?: boolean;
    messageOverride?: string;
}

export function CoachCard({ state, seamless = false, messageOverride }: CoachCardProps) {
    let message = "";
    let image = "/gabi-wave-left-v2.png"; // This is the default image path

    if (state.workoutsCompleted === 0) {
        message = "Start small. Consistency beats intensity.";
        image = "/gabi-wave-left-v2.png";
    } else if (state.currentStreak >= 2) {
        message = `Day ${state.currentStreak}.You’re building something real.`;
        image = "/gabi-wave-right-v2.png";
    } else {
        message = "No guilt. Just restart. One workout today.";
        image = "/gabi-wave-left-v2.png";
    }

    if (messageOverride) {
        message = messageOverride;
    }
    if (seamless) {
        return (
            <div className="flex flex-col items-center text-center p-4 w-full h-full justify-center animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8 fill-mode-both">
                <h2 className="text-xl font-bold text-gray-700 uppercase tracking-tight mb-2 w-full leading-tight shrink-0 opacity-80">
                    "{message}"
                </h2>
                <div className="relative w-[340px] h-[400px] max-h-[50vh] min-h-[300px] max-w-full hover:scale-105 transition-transform duration-500 ease-out shrink-1">
                    <Image
                        src={image}
                        alt="Coach Gabi"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm text-center border border-gray-100 flex flex-col items-center">
            <div className="relative w-[339px] h-[452px] mx-auto max-w-full">
                <Image
                    src={image}
                    alt="Coach Gabi"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <p className="mt-3 font-medium text-brand-600">{message}</p>
        </div>
    );
}
