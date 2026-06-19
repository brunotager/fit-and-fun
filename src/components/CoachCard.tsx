import React from 'react';
import Image from 'next/image';
import { Progress, Wardrobe } from '@/context/FitFunContext';
import { getItemById } from '@/data/shopItems';
import { useFitFun } from '@/context/FitFunContext';

interface CoachCardProps {
    state: Progress;
    seamless?: boolean;
    messageOverride?: string;
}

export function CoachCard({ state, seamless = false, messageOverride }: CoachCardProps) {
    const { wardrobe } = useFitFun();

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

    // Override image if a jersey is equipped
    const equippedJerseyId = wardrobe.equipped.jersey;
    if (equippedJerseyId) {
        const jerseyItem = getItemById(equippedJerseyId);
        if (jerseyItem) image = jerseyItem.gabiImage;
    }

    if (messageOverride) {
        message = messageOverride;
    }
    if (seamless) {
        return (
            <div className="flex flex-col items-center text-center p-4 w-full h-full justify-center animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8 fill-mode-both">
                <h2 className="text-xl font-bold text-gray-700 uppercase tracking-tight mb-2 w-full leading-tight shrink-0 opacity-80">
                    {message}
                </h2>
                <div className="relative w-[340px] flex-1 min-h-[200px] max-h-[45vh] max-w-full transition-transform duration-500 ease-out shrink">
                    <Image
                        src={image}
                        alt="Coach Gabi"
                        fill
                        unoptimized
                        className="object-contain"
                        priority
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[20px] bg-white p-6 shadow-sm text-center border border-stone-100 flex flex-col items-center">
            <div className="relative w-[339px] h-[452px] mx-auto max-w-full">
                <Image
                    src={image}
                    alt="Coach Gabi"
                    fill
                    unoptimized
                    className="object-contain"
                    priority
                />
            </div>
            <p className="mt-3 font-medium text-brand-600">{message}</p>
        </div>
    );
}
