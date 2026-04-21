'use client';

import { useState, use, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { ChevronLeft, Play, Pause, Check, X, Star, Footprints, Flame, Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { workouts } from '@/data/workouts';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { CircularTimer } from '@/components/ui/CircularTimer';
import { useWorkoutLogic } from '@/hooks/useWorkoutLogic';
import Image from 'next/image';
import { Header } from '@/components/Header';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function WorkoutActivePage({ params }: PageProps) {
    const router = useRouter();
    const { completeWorkout, profile, progress } = useFitFun();

    // Unwrap params
    const resolvedParams = use(params);

    // Find workout by ID
    const workout = workouts.find(w => w.id === resolvedParams.id);
    const duration = workout ? workout.duration : 5;
    const type = workout ? workout.category : 'Workout';
    const steps = workout ? workout.steps : [];

    // Finish Confirmation State
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    // Bottom Sheet Expanded State
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);

    // Manual completion state override
    const [manualCompleted, setManualCompleted] = useState(false);

    // Hook for workout logic
    const {
        timeLeft,
        stepTimeLeft,
        currentStepIndex,
        isActive,
        isCompleted: hookCompleted,
        togglePause,
        formatTime,
        progressPercentage,
        stepProgressPercentage
    } = useWorkoutLogic(duration, steps.length, () => {
        triggerCompletion('timer_finished');
    });

    // Check if either hook says we are done, or we manually finished
    const isCompleted = hookCompleted || manualCompleted;

    // Calculate Gamified Math
    const weightKg = profile.weightUnit === 'lbs' ? (profile.weight || 150) * 0.453592 : (profile.weight || 68);
    const calculatedCalories = Math.round(duration * 6 * 3.5 * weightKg / 200);
    const calculatedPoints = duration === 5 ? 50 : duration === 10 ? 100 : 200;
    const completedDay = progress?.currentPlanDay || 1;

    // Handle Completion Celebration
    const triggerCompletion = (completionType: 'timer_finished' | 'manual_end' = 'manual_end') => {
        setManualCompleted(true); // Force local state to transparently switch to completion view
        const validCategory = (workout?.category.toLowerCase() as any) || 'cardio';
        completeWorkout({
            type: validCategory,
            duration: duration,
            points: calculatedPoints,
            calories: calculatedCalories,
            workoutId: workout?.id || 'unknown',
            completionType: completionType
        });
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#F97316', '#FDBA74', '#FFEDD5']
            });
        }, 300); // Slight delay for modal entrance

    };

    // State for step celebration
    const [showStepCelebrate, setShowStepCelebrate] = useState(false);
    const prevStepRef = useRef(currentStepIndex);
    const activeStepRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Effect to trigger micro-celebration on step change
    useEffect(() => {
        if (currentStepIndex > prevStepRef.current) {
            setShowStepCelebrate(true);
            const timer = setTimeout(() => setShowStepCelebrate(false), 1500); // 1.5s display
            return () => clearTimeout(timer);
        }
        prevStepRef.current = currentStepIndex;
    }, [currentStepIndex]);
    // Auto-scroll the active step into view when it changes, or when sheet opens
    useEffect(() => {
        if (isSheetExpanded && activeStepRef.current && scrollContainerRef.current) {
            // Slight delay to allow CSS transitions to complete before calculating offset
            setTimeout(() => {
                if (activeStepRef.current) {
                   activeStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }, [currentStepIndex, isSheetExpanded]);


    if (isCompleted) {
        // --- COMPLETION VIEW (Restored Design + Gabi) ---
        const stepCount = workout ? workout.duration * 100 : 0;
        
        // At this point, the context may have incremented `currentPlanDay`.
        // We use the locked `completedDay` calculated outside, but since component re-renders,
        // it might shift. It's safer to use progress.currentPlanDay - 1 if it incremented, 
        // but `Math.max(1, progress.currentPlanDay - 1)` perfectly represents the last completed day.
        const displayDay = Math.max(1, progress.currentPlanDay - 1);

        const getMotivationalMessage = (day: number) => {
            switch(day) {
                case 1: return "First step taken! The journey has officially begun.";
                case 2: return "Day 2 complete! You're building momentum.";
                case 3: return "Three days in! You're building a serious habit.";
                case 4: return "Past the midway point! Your consistency is paying off.";
                case 5: return "Day 5 crushed! The finish line is in sight.";
                case 6: return "Only one day left! Let's finish strong.";
                case 7: return "You did it! 7 Days of consistent action! Beta Complete!";
                default: return "Awesome job! You just crushed another workout.";
            }
        };

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"></div>

                {/* Modal Card */}
                <div className="relative w-full max-w-sm bg-white rounded-3xl p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 shadow-2xl">

                    {/* Gabi Image (Added) */}
                    <div className="relative w-40 h-40 mx-auto -mt-20 mb-2 transform hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/gabi-celebrate-v2.png"
                            alt="Celebrating Penguin"
                            fill
                            className="object-contain drop-shadow-lg"
                        />
                    </div>

                    <div className="bg-brand-100 text-brand-600 px-4 py-1.5 rounded-full font-bold text-sm inline-block mx-auto mb-4 tracking-wide">
                        DAY {displayDay} COMPLETED!
                    </div>

                    {/* Header */}
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-4">CONGRATS!</h1>

                    <p className="text-gray-600 mb-8 leading-relaxed text-[15px] font-medium px-2">
                        {getMotivationalMessage(displayDay)}
                    </p>

                    {/* Stats */}
                    <div className="flex justify-between items-start mb-10 px-4">
                        <div className="flex flex-col items-center gap-1">
                            <Star size={28} className="text-gray-900 mb-1" strokeWidth={1.5} />
                            <span className="text-xl font-bold text-gray-900">{calculatedPoints}</span>
                            <span className="text-xs text-gray-500 font-medium lowercase">points</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Footprints size={28} className="text-gray-900 mb-1" strokeWidth={1.5} />
                            <span className="text-xl font-bold text-gray-900">{stepCount}</span>
                            <span className="text-xs text-gray-500 font-medium lowercase">steps</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Flame size={28} className="text-gray-900 mb-1" strokeWidth={1.5} />
                            <span className="text-xl font-bold text-gray-900">{calculatedCalories}</span>
                            <span className="text-xs text-gray-500 font-medium lowercase">calories</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => router.push('/progress')}
                            className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold py-4 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-wider text-sm"
                        >
                            CLAIM REWARD
                        </button>
                        <button
                            onClick={() => router.push('/home')}
                            className="w-full bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-800 font-bold py-4 rounded-full active:scale-95 transition-transform uppercase tracking-wider text-sm"
                        >
                            BACK HOME
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 flex flex-col bg-[#FFFDF7] overflow-hidden animate-in fade-in duration-500">
            {/* 1. Header */}
            <Header 
                showBack 
                onBack={() => setShowFinishConfirm(true)} 
                title={`${type} • ${duration} Mins`} 
            />

            {/* 2. Main Timer Area */}
            <div className="flex flex-col items-center pt-4 md:pt-8 w-full shrink-0">

                {/* BIG TIMER (Total) */}
                <div className="relative mb-8 transform scale-100 md:scale-110 transition-transform">
                    <CircularTimer
                        progress={progressPercentage}
                        size={220}
                        strokeWidth={10}
                        color="#f97316" // brand-500
                        trackColor="#e5e7eb" // gray-200
                    >
                        <div className="flex flex-col items-center">
                            {/* Static Number */}
                            <div className="relative h-16 w-48 flex justify-center items-center overflow-hidden">
                                <span className="text-6xl font-black text-gray-800 tabular-nums tracking-tight">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">TOTAL TIME</span>
                        </div>
                    </CircularTimer>

                    {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full z-20 backdrop-blur-[2px]">
                            <span className="bg-white px-4 py-2 rounded-full shadow-lg text-gray-500 font-bold uppercase tracking-wider text-sm border border-gray-100">Paused</span>
                        </div>
                    )}
                </div>

                {/* CONTROLS */}
                <div className="flex items-center gap-6 mb-8 z-10">
                    <button
                        onClick={togglePause}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95 border border-gray-100"
                    >
                        {isActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                    </button>

                    <button
                        onClick={() => setShowFinishConfirm(true)}
                        className="h-16 px-8 rounded-full bg-brand-500 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wide"
                    >
                        <Check size={20} strokeWidth={3} />
                        <span>Finish Now</span>
                    </button>
                </div>

            </div>

            {/* 3. Persistent "Now / Next" Panel */}
            <motion.div 
                layout
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} 
                className={clsx(
                    "bg-white rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40 flex flex-col w-full mt-auto relative overflow-hidden",
                    isSheetExpanded ? "flex-1" : "h-[180px]" // Compact height vs Expanded
                )}
            >
                {/* Drag Handle */}
                <motion.div
                    layout="position"
                    className="w-full pt-4 pb-2 flex justify-center cursor-pointer shrink-0"
                    onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                >
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </motion.div>

                {/* Compact View Content */}
                <motion.div layout="position" className="px-6 pt-2 pb-6 flex items-center gap-5 shrink-0 relative">

                    {/* Step Timer (Secondary but First Class) */}
                    <div className="relative shrink-0">
                        {showStepCelebrate && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute inset-0 z-20 flex items-center justify-center bg-brand-500 rounded-full"
                            >
                                <Check size={32} className="text-white" strokeWidth={4} />
                            </motion.div>
                        )}
                        <CircularTimer
                            progress={stepProgressPercentage}
                            size={90}
                            strokeWidth={7}
                            color="#f97316"
                            trackColor="#f3f4f6"
                        >
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-xl font-black text-gray-800 tabular-nums leading-none mb-0.5">
                                    {formatTime(stepTimeLeft)}
                                </span>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">STEP</span>
                            </div>
                        </CircularTimer>
                    </div>

                    {/* Text Area */}
                    <div className="flex-1 min-w-0" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
                        {/* NOW */}
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">NOW</span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{currentStepIndex + 1} / {steps.length}</span>
                            </div>
                            <AnimatePresence mode='wait'>
                                <motion.h3
                                    key={currentStepIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-lg font-bold text-gray-900 leading-tight truncate"
                                >
                                    {steps[currentStepIndex]}
                                </motion.h3>
                            </AnimatePresence>
                        </div>

                        {/* NEXT */}
                        {currentStepIndex < steps.length - 1 && (
                            <div className="flex items-center gap-2 opacity-50">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">NEXT</span>
                                <span className="text-sm font-medium text-gray-500 truncate">{steps[currentStepIndex + 1]}</span>
                            </div>
                        )}
                    </div>

                    {/* Expand/Collapse Toggle Icon */}
                    <div className="text-gray-300" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
                        {isSheetExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                    </div>
                </motion.div>

                {/* Expanded List (Scrollable) */}
                <motion.div 
                    layout="position"
                    ref={scrollContainerRef}
                    className={clsx(
                        "flex-1 overflow-y-auto px-6 py-2 border-t border-gray-100 transition-opacity duration-300 custom-scrollbar min-h-0",
                        isSheetExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                >
                    {steps.map((step, idx) => {
                        const isCurrent = idx === currentStepIndex;
                        const isCompleted = idx < currentStepIndex;
                        return (
                            <div 
                                key={idx} 
                                ref={isCurrent ? activeStepRef : null}
                                className={clsx(
                                    "flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 transition-all duration-300",
                                    isCurrent ? "opacity-100 scale-100" : isCompleted ? "opacity-40 scale-95" : "opacity-100"
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                    isCurrent ? "bg-brand-500 text-white shadow-md" : isCompleted ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    {isCompleted ? <Check size={14} strokeWidth={3} /> : (idx + 1)}
                                </div>
                                <span className={clsx(
                                    "text-sm font-medium transition-colors duration-300",
                                    isCurrent ? "font-bold text-gray-900 text-base" : "text-gray-500"
                                )}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </motion.div>

            </motion.div>

            {/* 4. Finish Confirmation Modal */}
            <AnimatePresence>
                {showFinishConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowFinishConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl relative z-10 text-center"
                        >
                            <h3 className="text-xl font-black text-gray-900 mb-2">Finish Workout?</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Are you sure you want to end this session?</p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setShowFinishConfirm(false); triggerCompletion('manual_end'); }}
                                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
                                >
                                    Yes, Finish
                                </button>
                                <button
                                    onClick={() => setShowFinishConfirm(false)}
                                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
