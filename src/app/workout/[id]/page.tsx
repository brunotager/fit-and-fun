'use client';

import { useState, use, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { ChevronLeft, Play, Pause, Check, X, Star, Footprints, Flame, Trophy, ChevronUp, ChevronDown, Bell, BellRing } from 'lucide-react';
// P2: Lazy load confetti — only imported when workout completes
import { workouts } from '@/data/workouts';
import { getItemById } from '@/data/shopItems';
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
    const { completeWorkout, profile, progress, userId, notificationsEnabled, setNotificationsEnabled, notificationPromptCount, incrementNotificationPromptCount, wardrobe, workoutPlan } = useFitFun();

    // Determine celebrate image based on equipped jersey
    const equippedJersey = wardrobe.equipped.jersey ? getItemById(wardrobe.equipped.jersey) : null;
    const celebrateImage = equippedJersey ? equippedJersey.gabiCelebrateImage : '/gabi-celebrate-v2.png';

    // Unwrap params
    const resolvedParams = use(params);

    // Find workout by ID
    const workout = (workoutPlan || []).find(w => w.id === resolvedParams.id) || workouts.find(w => w.id === resolvedParams.id);
    const duration = workout ? workout.duration : 5;
    const type = workout ? workout.category : 'Workout';
    const steps = workout ? workout.steps : [];

    // Finish Confirmation State
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    // Toggle loading state for notification subscribe
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribeError, setSubscribeError] = useState<string | null>(null);


    // U1: Guard to prevent double-completion
    const hasCompletedRef = useRef(false);
    // Track which type of completion happened for the UI
    const [completionKind, setCompletionKind] = useState<'timer_finished' | 'manual_end'>('manual_end');

    // Bottom Sheet Expanded State
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);

    // Manual completion state override
    const [manualCompleted, setManualCompleted] = useState(false);

    // Hook for workout logic
    const {
        timeLeft,
        stepTimeLeft,
        currentStepIndex,
        isResting,
        nextExerciseIndex,
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

    // Snapshot the prompt count at mount so the copy stays stable during this view.
    // The effect increments the count for the NEXT workout completion.
    const promptCountAtMountRef = useRef(notificationPromptCount);
    const hasCountedPromptRef = useRef(false);
    useEffect(() => {
        if (isCompleted && completionKind === 'timer_finished' && promptCountAtMountRef.current < 2 && !hasCountedPromptRef.current) {
            hasCountedPromptRef.current = true;
            incrementNotificationPromptCount();
        }
    }, [isCompleted, completionKind, incrementNotificationPromptCount]);

    // Calculate Gamified Math
    const weightKg = profile.weightUnit === 'lbs' ? (profile.weight || 150) * 0.453592 : (profile.weight || 68);
    const calculatedCalories = Math.round(duration * 6 * 3.5 * weightKg / 200);
    const calculatedPoints = duration === 5 ? 50 : duration === 10 ? 100 : 200;
    const completedDay = progress?.currentPlanDay || 1;

    // Handle Completion Celebration
    const triggerCompletion = (completionType: 'timer_finished' | 'manual_end' = 'manual_end') => {
        // U1: Guard against double-completion
        if (hasCompletedRef.current) return;
        hasCompletedRef.current = true;

        setCompletionKind(completionType);
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

        // P2: Only load confetti when actually needed, and only for full completions
        if (completionType === 'timer_finished') {
            import('canvas-confetti').then(({ default: confetti }) => {
                setTimeout(() => {
                    confetti({
                        particleCount: 150,
                        spread: 80,
                        origin: { y: 0.6 },
                        colors: ['#E86A20', '#FDBA74', '#FFEDD5']
                    });
                }, 300);
            });
        }
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

        const getMotivationalMessage = (day: number): { text: string; emoji: string } => {
            switch(day) {
                case 1: return { text: "It's ok if you didn't do the full minutes!", emoji: "💪" };
                case 2: return { text: "Look at that, you did 2 days!", emoji: "😊" };
                case 3: return { text: "Now we're getting the hang of it! Keep it up.", emoji: "🔥" };
                case 4: return { text: "More than halfway there!", emoji: "⭐" };
                case 5: return { text: "Just a couple more days and you did it!", emoji: "🏃" };
                case 6: return { text: "Let's Go! You're on a roll.", emoji: "💥" };
                case 7: return { text: "You can be proud of yourself! I hope you feel good.", emoji: "🏆" };
                default: return { text: "Awesome job! You just crushed another workout.", emoji: "🎉" };
            }
        };

        const motivational = getMotivationalMessage(displayDay);
        const subline = displayDay <= 5
            ? "See you tomorrow!"
            : displayDay === 6
                ? "See you for the last day tomorrow!"
                : "Free Plan Complete";

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500"></div>

                {/* Modal Card */}
                <div className="relative w-full max-w-sm bg-white rounded-[20px] p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 shadow-2xl">

                    {/* Gabi Image (Added) */}
                    <div className="relative w-40 h-40 mx-auto -mt-20 mb-2 transform hover:scale-105 transition-transform duration-300">
                        <Image
                            src={celebrateImage}
                            alt="Celebrating Penguin"
                            fill
                            unoptimized
                            className="object-contain drop-shadow-lg"
                        />
                    </div>

                    {/* DAY X COMPLETED - at very top */}
                    <div className={`px-4 py-1.5 rounded-full font-bold text-sm inline-block mx-auto mb-3 tracking-wide ${
                        completionKind === 'timer_finished' ? 'bg-brand-100 text-brand-600' : 'bg-stone-100 text-stone-600'
                    }`}>
                        {completionKind === 'timer_finished' ? `DAY ${displayDay} COMPLETED` : 'WORKOUT ENDED EARLY'}
                    </div>

                    {/* CONGRATS! */}
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase mb-4">
                        {completionKind === 'timer_finished' ? 'CONGRATS!' : 'GOOD EFFORT!'}
                    </h1>

                    {/* Day-specific motivational message with emoji drop */}
                    <p className="text-gray-600 mb-2 leading-relaxed text-[15px] font-medium px-2">
                        {completionKind === 'timer_finished'
                            ? (
                                <>
                                    {motivational.text}{' '}
                                    <motion.span
                                        initial={{ y: -30, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.8, duration: 0.5, type: 'spring', bounce: 0.5 }}
                                        className="inline-block text-xl"
                                    >
                                        {motivational.emoji}
                                    </motion.span>
                                </>
                            )
                            : "You ended early — no points this time. Complete the full workout to earn your reward!"}
                    </p>
                    {completionKind === 'timer_finished' && (
                        <p className="text-gray-500 mb-8 text-sm font-medium">{subline}</p>
                    )}
                    {completionKind !== 'timer_finished' && <div className="mb-8" />}

                    {/* Stats */}
                    <div className="flex justify-between items-start mb-10 px-4">
                        <div className="flex flex-col items-center gap-1">
                            <Star size={28} className={`mb-1 ${completionKind === 'timer_finished' ? 'text-gray-900' : 'text-gray-300'}`} strokeWidth={1.5} />
                            <span className={`text-xl font-bold ${completionKind === 'timer_finished' ? 'text-gray-900' : 'text-gray-300'}`}>{completionKind === 'timer_finished' ? calculatedPoints : 0}</span>
                            <span className="text-xs text-gray-500 font-medium lowercase">points</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Footprints size={28} className={`mb-1 ${completionKind === 'timer_finished' ? 'text-gray-900' : 'text-gray-300'}`} strokeWidth={1.5} />
                            <span className={`text-xl font-bold ${completionKind === 'timer_finished' ? 'text-gray-900' : 'text-gray-300'}`}>{completionKind === 'timer_finished' ? stepCount : 0}</span>
                            <span className="text-xs text-gray-500 font-medium lowercase">steps</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Flame size={28} className={`mb-1 ${completionKind === 'timer_finished' ? 'text-gray-900' : 'text-gray-300'}`} strokeWidth={1.5} />
                            <span className={`text-xl font-bold ${completionKind === 'timer_finished' ? 'text-gray-900' : 'text-gray-300'}`}>{completionKind === 'timer_finished' ? calculatedCalories : 0}</span>
                            <span className="text-xs text-gray-500 font-medium lowercase">calories</span>
                        </div>
                    </div>

                    {/* Notification Opt-in (Day 1 and Day 2 only, timer_finished only) */}
                    {completionKind === 'timer_finished' && promptCountAtMountRef.current < 2 && (
                        <div className={`rounded-2xl p-4 mb-4 border transition-colors duration-300 ${notificationsEnabled ? 'bg-brand-50 border-brand-100' : 'bg-stone-50 border-stone-200'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {notificationsEnabled
                                        ? <BellRing size={20} className="shrink-0 text-brand-600 transition-colors duration-300" />
                                        : <Bell size={20} className="shrink-0 text-brand-500 transition-colors duration-300" />
                                    }
                                    <div className="min-w-0">
                                        {notificationsEnabled ? (
                                            <>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                                    Reminders on!
                                                </p>
                                                <p className="text-xs text-gray-600 mt-0.5 leading-tight">
                                                    We&apos;ll remind you daily. Adjust the time in Settings.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">
                                                    {promptCountAtMountRef.current === 0
                                                        ? "Want a daily reminder?"
                                                        : "Last chance, turn on reminders?"}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                                                    {promptCountAtMountRef.current === 0
                                                        ? "We'll send you a notification just in case you need a reminder to workout. Life gets busy!"
                                                        : "If you decide later to turn on notifications, you can do it in the settings."}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={notificationsEnabled}
                                    aria-label="Toggle daily reminders"
                                    disabled={isSubscribing}
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (isSubscribing) return;
                                        setIsSubscribing(true);
                                        setSubscribeError(null);

                                        const wasEnabled = notificationsEnabled;
                                        setNotificationsEnabled(!wasEnabled); // optimistic flip

                                        try {
                                            if (wasEnabled) {
                                                // Turn off
                                                const { unsubscribeFromPush } = await import('@/lib/notifications');
                                                await unsubscribeFromPush(userId);
                                            } else {
                                                // Turn on
                                                const { subscribeToPush, isNotificationSupported, getNotificationPermission } = await import('@/lib/notifications');
                                                if (!isNotificationSupported()) {
                                                    setNotificationsEnabled(false);
                                                    setSubscribeError('Your browser doesn\'t support notifications.');
                                                    return;
                                                }
                                                const permission = getNotificationPermission();
                                                if (permission === 'denied') {
                                                    setNotificationsEnabled(false);
                                                    setSubscribeError('Notifications are blocked. Update your browser settings to allow them.');
                                                    return;
                                                }
                                                const success = await subscribeToPush(userId);
                                                if (!success) {
                                                    setNotificationsEnabled(false);
                                                    setSubscribeError('Something went wrong. You can try again in Settings.');
                                                }
                                            }
                                        } catch {
                                            setNotificationsEnabled(wasEnabled); // revert
                                            setSubscribeError('Something went wrong. You can try again in Settings.');
                                        } finally {
                                            setIsSubscribing(false);
                                        }
                                    }}
                                    className={`relative w-14 h-8 rounded-full shrink-0 transition-colors duration-300 ml-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${isSubscribing ? 'opacity-50 cursor-wait' : ''} ${notificationsEnabled ? 'bg-brand-500' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full shadow-md transition-transform duration-300 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            {subscribeError && (
                                <p className="text-xs text-amber-700 mt-2 leading-tight bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    {subscribeError}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col gap-3">
                        {completionKind === 'timer_finished' ? (
                            <button
                                onClick={() => {
                                    router.push('/progress');
                                }}
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_30px_rgb(232,106,32,0.25)] active:scale-95 transition-transform uppercase tracking-wider text-sm"
                            >
                                CLAIM REWARD
                            </button>
                        ) : (
                            <button
                                onClick={() => { hasCompletedRef.current = false; setManualCompleted(false); }}
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_30px_rgb(232,106,32,0.25)] active:scale-95 transition-transform uppercase tracking-wider text-sm"
                            >
                                RESTART WORKOUT
                            </button>
                        )}
                        <button
                            onClick={() => router.push('/home')}
                            className="w-full bg-white border-2 border-stone-200 hover:bg-stone-50 text-stone-800 font-bold py-4 rounded-[20px] active:scale-95 transition-transform uppercase tracking-wider text-sm"
                        >
                            BACK HOME
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Derive the current GIF URL (if available)
    const gifUrls = workout?.gifUrls || [];
    const currentGifUrl = !isResting && gifUrls[currentStepIndex] ? gifUrls[currentStepIndex] : '';

    return (
        <div className="absolute inset-0 flex flex-col bg-[#FFFDF7] overflow-hidden animate-in fade-in duration-500">
            {/* 1. Header */}
            <Header 
                showBack 
                onBack={() => setShowFinishConfirm(true)} 
                title={`${type} • ${duration} Mins`} 
            />

            {/* 2. Main Content Area — scrollable if needed */}
            <div className="flex flex-col items-center pt-2 md:pt-4 w-full shrink-0 px-6 flex-1 min-h-0">

                {/* GIF / Timer Display Card */}
                <div className="relative w-full max-w-[260px] aspect-square rounded-[20px] overflow-hidden bg-[#FFFDF7] mb-4 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {isResting ? (
                            /* Rest Period — Coach Gabi breathing video */
                            <motion.div
                                key={`rest-${currentStepIndex}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex items-center justify-center"
                            >
                                <video
                                    src="/coach-gabi-breathing.mp4"
                                    autoPlay
                                    loop
                                    playsInline
                                    className="max-w-full max-h-full object-contain rounded-[12px]"
                                />
                            </motion.div>
                        ) : currentGifUrl ? (
                            /* Exercise demonstration — supports .gif and .mp4 */
                            <motion.div
                                key={`gif-${currentStepIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full flex items-center justify-center bg-[#FFFDF7] p-2"
                            >
                                {currentGifUrl.endsWith('.mp4') ? (
                                    <video
                                        key={currentGifUrl}
                                        src={currentGifUrl}
                                        autoPlay
                                        loop
                                        playsInline
                                        className="max-w-full max-h-full object-contain rounded-[12px]"
                                    />
                                ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img
                                        src={currentGifUrl}
                                        alt={steps[currentStepIndex] || 'Exercise demonstration'}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                )}
                            </motion.div>
                        ) : (
                            /* Fallback: Circular Timer (no GIF available) */
                            <motion.div
                                key={`timer-${currentStepIndex}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center justify-center"
                            >
                                <CircularTimer
                                    progress={stepProgressPercentage}
                                    size={200}
                                    strokeWidth={10}
                                    color="#E86A20"
                                    trackColor="#e5e7eb"
                                >
                                    <div className="flex flex-col items-center">
                                        <span className="text-5xl font-black tabular-nums tracking-tight text-gray-800">
                                            {formatTime(stepTimeLeft)}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                                            STEP {currentStepIndex + 1} / {steps.length}
                                        </span>
                                    </div>
                                </CircularTimer>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Paused Overlay */}
                    {!isActive && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-20 backdrop-blur-[2px]">
                            <span className="bg-white px-4 py-2 rounded-full shadow-lg text-gray-500 font-bold uppercase tracking-wider text-sm border border-gray-100">Paused</span>
                        </div>
                    )}
                </div>

                {/* Linear Progress Bar */}
                <div className="w-full max-w-[260px] mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${isResting ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                animate={{ width: `${100 - stepProgressPercentage}%` }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </div>
                        <span className={`text-sm font-black tabular-nums shrink-0 ${isResting ? 'text-emerald-600' : 'text-gray-800'}`}>
                            {formatTime(stepTimeLeft)}
                        </span>
                    </div>
                </div>

                {/* Step Label + Exercise Name */}
                <AnimatePresence mode="wait">
                    {!isResting && (
                        <motion.div
                            key={`name-${currentStepIndex}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="text-center mb-5 max-w-[260px]"
                        >
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">
                                STEP {currentStepIndex + 1} OF {steps.length}
                            </span>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase truncate px-2">
                                {steps[currentStepIndex]}
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* CONTROLS */}
                <div className="flex items-center gap-6 mb-6 z-10">
                    <button
                        onClick={togglePause}
                        className="w-16 h-16 flex items-center justify-center rounded-full bg-white text-gray-800 shadow-md hover:shadow-lg hover:bg-gray-50 transition-all active:scale-95 border border-gray-100"
                    >
                        {isActive ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                    </button>

                    <button
                        onClick={() => setShowFinishConfirm(true)}
                        className="h-16 px-8 rounded-[20px] bg-brand-500 text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-wide"
                    >
                        <Check size={20} strokeWidth={3} />
                        <span>Finish Now</span>
                    </button>
                </div>

            </div>

            {/* 3. Bottom "Next" Panel */}
            <motion.div 
                layout
                transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }} 
                className={clsx(
                    "bg-white rounded-t-[20px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)] flex flex-col w-full relative overflow-hidden",
                    isSheetExpanded 
                        ? "fixed bottom-0 left-0 right-0 z-50 h-[75vh]" 
                        : "mt-auto z-40 h-[160px]"
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
                <motion.div layout="position" className="px-6 pt-1 pb-4 flex items-center gap-5 shrink-0 relative">

                    {/* Total Timer */}
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
                            progress={progressPercentage}
                            size={80}
                            strokeWidth={6}
                            color="#E86A20"
                            trackColor="#f3f4f6"
                        >
                            <div className="flex flex-col items-center justify-center h-full">
                                <span className="text-lg font-black tabular-nums leading-none mb-0.5 text-gray-800">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-[8px] font-bold uppercase tracking-wide text-gray-400">
                                    TOTAL
                                </span>
                            </div>
                        </CircularTimer>
                    </div>

                    {/* Next Exercise Preview */}
                    <div className="flex-1 min-w-0" onClick={() => setIsSheetExpanded(!isSheetExpanded)}>
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={`next-${currentStepIndex}-${isResting}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* Next Exercise */}
                                {(isResting ? currentStepIndex + 1 : currentStepIndex + 1) < steps.length ? (
                                    <div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">NEXT</span>
                                        <h3 className="text-base font-bold text-gray-800 leading-tight truncate">
                                            {steps[isResting ? currentStepIndex + 1 : currentStepIndex + 1]}
                                        </h3>
                                        {/* Show one more after next if available */}
                                        {(isResting ? currentStepIndex + 2 : currentStepIndex + 2) < steps.length && (
                                            <div className="flex items-center gap-2 mt-1.5 opacity-40">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">THEN</span>
                                                <span className="text-sm font-medium text-gray-500 truncate">{steps[isResting ? currentStepIndex + 2 : currentStepIndex + 2]}</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest block mb-1">LAST EXERCISE</span>
                                        <h3 className="text-base font-bold text-gray-800 leading-tight">Almost done!</h3>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
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
                        const isStepCompleted = idx < currentStepIndex;
                        return (
                            <div 
                                key={idx} 
                                ref={isCurrent ? activeStepRef : null}
                                className={clsx(
                                    "flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 transition-all duration-300",
                                    isCurrent ? "opacity-100 scale-100" : isStepCompleted ? "opacity-40 scale-95" : "opacity-100"
                                )}
                            >
                                <div className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                                    isCurrent ? "bg-brand-500 text-white shadow-md" : isStepCompleted ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-400"
                                )}>
                                    {isStepCompleted ? <Check size={14} strokeWidth={3} /> : (idx + 1)}
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
                            className="bg-white rounded-[20px] p-8 w-full max-w-xs shadow-2xl relative z-10 text-center"
                        >
                            <h3 className="text-xl font-black text-gray-900 mb-2">Finish Workout?</h3>
                            <p className="text-gray-500 text-sm mb-8 leading-relaxed">Are you sure you want to end this session?</p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => { setShowFinishConfirm(false); triggerCompletion('manual_end'); }}
                                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-[20px] hover:bg-brand-600 shadow-[0_8px_30px_rgb(232,106,32,0.25)] active:scale-95 transition-transform"
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
