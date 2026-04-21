'use client';

import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Header } from '@/components/Header';
import { Check, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function ProgressPage() {
    const router = useRouter();
    const { progress } = useFitFun();
    const currentDay = progress.currentPlanDay || 1;

    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // Map currentDay (1 to 7) to percentage along path (0.0 to 1.0)
    // Day 1 starts at 0%
    // Day 7 ends at 100%
    const targetProgress = (Math.min(currentDay - 1, 6)) / 6;
    const initialProgress = Math.max(0, currentDay - 2) / 6;

    const pathProgress = useMotionValue(initialProgress); 

    useEffect(() => {
        if (pathRef.current) {
            setPathLength(pathRef.current.getTotalLength());
            setIsReady(true);
        }
    }, [pathRef]);

    useEffect(() => {
        if (!isReady) return;
        // Animate up to the target progress smoothly on load
        animate(pathProgress, targetProgress, { duration: 1.5, ease: "easeOut" });
    }, [isReady, targetProgress, pathProgress]);

    // Avatar Positioning Transforms tied explicitly to the pathProgress state
    const avatarLeft = useTransform(pathProgress, (p) => {
        if (!pathRef.current || pathLength === 0) return "50%";
        const point = pathRef.current.getPointAtLength(p * pathLength);
        return `${(point.x / 400) * 100}%`;
    });

    const avatarTop = useTransform(pathProgress, (p) => {
        if (!pathRef.current || pathLength === 0) return "93.3%"; // Fallback roughly near path start
        const point = pathRef.current.getPointAtLength(p * pathLength);
        return `${(point.y / 600) * 100}%`;
    });

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] pb-20 overflow-hidden relative animate-in fade-in duration-700">
            <Header showBack backTo="/home" title="Progress Map" />
            
            <div className="flex-1 flex flex-col px-6 h-full relative mt-4">
                {/* Header Summary */}
                <header className="text-center z-20 mb-6 relative">
                    <h1 className="text-3xl font-black text-gray-900 mb-1">Day {Math.min(currentDay, 7)}</h1>
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500">
                        <span className="bg-brand-50 px-4 py-1.5 rounded-full text-xs tracking-wider text-brand-600 font-black border border-brand-100 shadow-sm">
                            {progress.totalPoints} POINTS
                        </span>
                    </div>
                </header>

                <div className="flex-1 relative w-full h-full mx-auto max-w-[280px] self-center">
                    {/* SVG Path Container */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 600" preserveAspectRatio="none">
                        <path
                            d="M 200 560 C 350 490, 350 400, 300 350 S 50 300, 100 250 S 350 200, 300 150 S 150 100, 200 50"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            strokeLinecap="round"
                        />
                        <motion.path
                            ref={pathRef}
                            d="M 200 560 C 350 490, 350 400, 300 350 S 50 300, 100 250 S 350 200, 300 150 S 150 100, 200 50"
                            fill="none"
                            stroke="#EA580C"
                            strokeWidth="8"
                            strokeLinecap="round"
                            style={{ pathLength: pathProgress }}
                        />
                    </svg>

                    {/* The Moving Indicator Layer */}
                    <motion.div
                        onClick={() => router.push('/workouts')}
                        className="absolute z-40 w-12 h-12 rounded-full bg-[#EA580C] ring-4 ring-white shadow-[0_8px_30px_rgb(234,88,12,0.4)] flex items-center justify-center cursor-pointer pointer-events-auto hover:scale-105 active:scale-95 transition-transform"
                        style={{ top: avatarTop, left: avatarLeft, x: "-50%", y: "-50%" }}
                    >
                        <div className="w-5 h-5 bg-white rounded-full animate-pulse" />

                        {/* Explicit Pointer Label */}
                        <div className="absolute top-[120%] cursor-pointer pointer-events-auto whitespace-nowrap font-black text-sm text-gray-900 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-stone-200 flex items-center gap-1.5 transition-transform hover:scale-105">
                            Day {Math.min(currentDay, 7)}
                            <ChevronRight size={14} className="text-[#EA580C] -mr-1" strokeWidth={3} />
                        </div>
                    </motion.div>

                    {/* Map Nodes 1 to 7 mathematically */}
                    {Array.from({ length: 7 }).map((_, i) => {
                        const dayNumber = i + 1;
                        const p = i / 6; // percentage 0 to 1
                        
                        return <PathNode key={dayNumber} dayNumber={dayNumber} percent={p} pathRef={pathRef} pathLength={pathLength} currentDay={Math.min(currentDay, 7)} />
                    })}
                </div>
            </div>
        </div>
    );
}

function PathNode({ dayNumber, percent, pathRef, pathLength, currentDay }: { dayNumber: number, percent: number, pathRef: React.RefObject<SVGPathElement | null>, pathLength: number, currentDay: number }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (pathRef.current && pathLength > 0) {
            const point = pathRef.current.getPointAtLength(percent * pathLength);
            setPos({ x: (point.x / 400) * 100, y: (point.y / 600) * 100 });
        }
    }, [pathRef, pathLength, percent]);

    if (pos.x === 0 && pos.y === 0) return null; // Wait for exact coordinate layout calc

    const isCompleted = dayNumber < currentDay;
    const isCurrent = dayNumber === currentDay;

    return (
        <div 
            className="absolute z-10 flex flex-col items-center pointer-events-none"
            style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`, 
                transform: 'translate(-50%, -50%)' 
            }}
        >
            <div className={clsx(
                "w-12 h-12 flex items-center justify-center rounded-full font-black text-md shadow-md transition-all duration-500 backdrop-blur-sm",
                isCompleted ? "bg-[#FFFDF7] text-gray-800 border-2 border-[#EA580C] shadow-sm" :
                isCurrent ? "opacity-0" : // Let the animated avatar core handle the visual for the current node
                "bg-gray-100 text-gray-400 border-2 border-white opacity-90 scale-90"
            )}>
                {isCompleted ? <Check size={20} className="text-[#EA580C]" strokeWidth={3} /> : dayNumber}
            </div>
            
            {/* Explicit Label Positioning avoiding S curve clash */}
            {(!isCurrent) && (
                <div className={clsx(
                    "absolute w-20 text-xs font-bold whitespace-nowrap drop-shadow-sm text-gray-500 flex items-center justify-center",
                    dayNumber === 1 && "top-[110%] mt-1",
                    dayNumber === 2 && "left-[110%] ml-2 top-1/2 -translate-y-1/2 justify-start",
                    dayNumber === 3 && "left-[110%] ml-2 top-1/2 -translate-y-1/2 justify-start",
                    dayNumber === 4 && "right-[110%] mr-2 top-1/2 -translate-y-1/2 justify-end",
                    dayNumber === 5 && "top-[110%] mt-1",
                    dayNumber === 6 && "left-[110%] ml-2 top-1/2 -translate-y-1/2 justify-start",
                    dayNumber === 7 && "right-[110%] mr-2 top-1/2 -translate-y-1/2 justify-end",
                )}>
                    Day {dayNumber}
                </div>
            )}
        </div>
    );
}
