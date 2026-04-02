'use client';

import { useFitFun } from '@/context/FitFunContext';
import { Star } from 'lucide-react';
import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'framer-motion';

// Level Defs
const LEVELS = [
    { id: 5, points: 400, label: 'LEVEL 5', sub: 'Locked' },
    { id: 4, points: 300, label: 'LEVEL 4', sub: 'Locked' },
    { id: 3, points: 200, label: 'LEVEL 3', sub: 'Current' },
    { id: 2, points: 100, label: 'LEVEL 2', sub: 'Completed' },
    { id: 1, points: 0, label: 'LEVEL 1', sub: 'Completed' },
];

export default function ProgressPage() {
    const { progress } = useFitFun();

    // --- ANIMATION STATE ---
    // 0: Initial (Level 2 Current)
    // 1: Pulse L2 (Become Completed)
    // 2: Fill Path (L2 -> L3)
    // 3: Move Avatar (L2 -> L3)
    // 4: Arrive L3 (Level 3 Current)
    const [animPhase, setAnimPhase] = useState(0);

    const pathRef = useRef<SVGPathElement>(null);
    const [pathLength, setPathLength] = useState(0);
    const [isReady, setIsReady] = useState(false);

    // We use a MotionValue to drive both the line and the avatar simultaneously
    const pathProgress = useMotionValue(0.30); // Fallback
    
    // Path Progress ends that we will calculate exactly based on SVG bezier length.
    const [pathProgressStart, setPathProgressStart] = useState(0.30);
    const [pathProgressEnd, setPathProgressEnd] = useState(0.54);

    useEffect(() => {
        if (pathRef.current) {
            const length = pathRef.current.getTotalLength();
            
            // Calculate exact start and end percentages
            let bestStart = 0.30;
            let bestEnd = 0.54;
            let minStartDist = Infinity;
            let minEndDist = Infinity;
            
            for(let i = 0; i <= 1; i += 0.0005) {
                const pt = pathRef.current.getPointAtLength(i * length);
                const distStart = Math.hypot(pt.x - 300, pt.y - 350);
                const distEnd = Math.hypot(pt.x - 100, pt.y - 250);
                
                if (distStart < minStartDist) {
                    minStartDist = distStart;
                    bestStart = i;
                }
                if (distEnd < minEndDist) {
                    minEndDist = distEnd;
                    bestEnd = i;
                }
            }
            
            setPathProgressStart(bestStart);
            setPathProgressEnd(bestEnd);
            pathProgress.set(bestStart);
            setPathLength(length);
            setIsReady(true);
        }
    }, [pathProgress]);

    const avatarLeft = useTransform(pathProgress, (p) => {
        if (!pathRef.current || pathLength === 0) return "75%";
        const point = pathRef.current.getPointAtLength(p * pathLength);
        return `${(point.x / 400) * 100}%`;
    });

    const avatarTop = useTransform(pathProgress, (p) => {
        if (!pathRef.current || pathLength === 0) return "58.333%";
        const point = pathRef.current.getPointAtLength(p * pathLength);
        return `${(point.y / 600) * 100}%`;
    });

    useEffect(() => {
        if (!isReady) return;

        // Run sequence on mount (simulate the transition requested)
        const sequence = async () => {
            // Wait a sec for hydration/fade-in
            await new Promise(r => setTimeout(r, 500));

            // Phase 1: Pulse L2 (300ms)
            setAnimPhase(1);
            await new Promise(r => setTimeout(r, 600)); // slightly longer for visibility

            // Phase 2: Fill Path & Move Avatar Together
            setAnimPhase(2);
            animate(pathProgress, pathProgressEnd, { duration: 1.2, ease: "easeInOut" });
            await new Promise(r => setTimeout(r, 1200)); // Wait full duration (1.2s)

            // Phase 3: Arrive (formerly Phase 4)
            setAnimPhase(3);
        };

        sequence();
    }, [isReady, pathProgressEnd, pathProgress]);

    // Derived State based on Animation Phase
    const currentLevelDisplay = animPhase < 3 ? 2 : 3;
    const totalPoints = 400; // Final goal is Level 5 (400 Points)

    // Sync points organically with path progress
    const animatedPoints = useTransform(
        pathProgress,
        [pathProgressStart, pathProgressEnd],
        [150, 250]
    );

    // Keep it an integer
    const displayPoints = useTransform(animatedPoints, (val) => Math.round(val));

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] p-6 pb-20 overflow-hidden relative animate-in fade-in duration-700">

            {/* 1. Top Section - Status Summary */}
            <header className="text-center z-20 mb-8">
                <h1 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">PROGRESS</h1>
                <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-gray-900 mb-1">Level {currentLevelDisplay}</span>
                    <motion.div
                        className="flex items-center gap-2 text-sm font-bold text-gray-500"
                    >
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs tracking-wide">
                            <motion.span>{displayPoints}</motion.span> / {totalPoints} Points
                        </span>
                    </motion.div>
                </div>
            </header>

            {/* 2. Main Section - Progress Path */}
            <div className="flex-1 relative w-full h-full mx-auto max-w-[280px] self-center">

                {/* SVG Path Container */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 600" preserveAspectRatio="none">
                    {/* 1. Gray Background Path (Full) */}
                    <path
                        d="M 200 520 C 350 450, 350 400, 300 350 S 50 300, 100 250 S 350 200, 300 150 S 150 100, 200 50"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />

                    {/* 2. Orange Progress Path (Animated) */}
                    <motion.path
                        ref={pathRef}
                        d="M 200 520 C 350 450, 350 400, 300 350 S 50 300, 100 250 S 350 200, 300 150 S 150 100, 200 50"
                        fill="none"
                        stroke="#F97316"
                        strokeWidth="8"
                        strokeLinecap="round"
                        style={{ pathLength: pathProgress }}
                    />
                </svg>

                {/* INDEPENDENT AVATAR LAYER */}
                <motion.div
                    className="absolute z-40 w-8 h-8 rounded-full bg-gray-600 ring-4 ring-white shadow-lg flex items-center justify-center pointer-events-none"
                    style={{ 
                        top: avatarTop, 
                        left: avatarLeft, 
                        x: "-50%", 
                        y: "-50%" 
                    }}
                    animate={{
                        scale: animPhase === 2 ? 1.1 : 1
                    }}
                    transition={{
                        duration: 1.2,
                        ease: "easeInOut"
                    }}
                />

                {/* Level Nodes */}

                <LevelNode
                    level={LEVELS[0]}
                    status='locked'
                    top="8.333%" left="50%"
                    labelPosition="left"
                />

                <LevelNode
                    level={LEVELS[1]}
                    status='locked'
                    top="25%" left="75%"
                />

                {/* Level 3 (Destination) */}
                <LevelNode
                    level={LEVELS[2]}
                    status={animPhase >= 3 ? 'current' : 'locked'}
                    top="41.666%" left="25%"
                    animatePulse={animPhase === 3}
                />

                {/* Level 2 (Start) */}
                <LevelNode
                    level={LEVELS[3]}
                    status={animPhase === 0 ? 'current' : 'completed'}
                    top="58.333%" left="75%"
                    animatePulse={animPhase === 1}
                    hideAvatarPlaceholder
                />

                <LevelNode
                    level={LEVELS[4]}
                    status='completed'
                    top="86.666%" left="50%"
                />

            </div>

            {/* 4. Bottom Section */}
            <div className="text-center mt-auto pt-4 translate-y-8">
                <p className="text-sm font-medium text-gray-400">
                    Consistency builds momentum.
                </p>
            </div>
        </div>
    );
}

// Node Component
type NodeStatus = 'completed' | 'current' | 'locked';

function LevelNode({ level, status, top, left, animatePulse, hideAvatarPlaceholder, labelPosition }: { level: any, status: NodeStatus, top: string, left: string, animatePulse?: boolean, hideAvatarPlaceholder?: boolean, labelPosition?: 'left' | 'right' | 'bottom' }) {
    const isRightSide = parseInt(left) > 50;
    const isCenter = parseInt(left) === 50;
    const position = labelPosition || (isCenter ? 'bottom' : (isRightSide ? 'right' : 'left'));

    return (
        <div
            className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ top, left }}
        >
            {/* PULSE EFFECT */}
            {animatePulse && (
                <motion.div
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 1.4, 1.2], opacity: [0.5, 0] }}
                    transition={{ duration: 0.6, times: [0, 0.5, 1] }}
                    className="absolute w-full h-full rounded-full bg-orange-400 z-0"
                />
            )}

            {/* The Node Circle */}
            <motion.div
                animate={{
                    scale: status === 'current' ? 1.1 : 1
                }}
                className={clsx(
                    "w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-sm z-10 relative transition-colors duration-500",
                    // A. Completed
                    status === 'completed' && "bg-[#fdba74] border-[#fed7aa]",
                    // B. Current
                    status === 'current' && "bg-white border-[#F97316] ring-4 ring-[#ffedd5]",
                    // C. Locked
                    status === 'locked' && "bg-gray-100 border-gray-200 grayscale"
                )}>
                {/* Icons */}
                {status === 'completed' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <Star size={24} fill="white" className="text-white" />
                    </motion.div>
                )}

                {status === 'locked' && (
                    <Star size={24} className="text-gray-300" strokeWidth={2} />
                )}

                {/* For Current, we usually show nothing inside as Avatar sits on top. 
                    Unless we want a placeholder? 
                    The independent avatar handles the visual.
                */}
            </motion.div>

            {/* Label */}
            <div className={clsx(
                "absolute top-4 w-32 pointer-events-none transition-opacity duration-300",
                position === 'bottom' ? "text-center left-1/2 -translate-x-1/2 mt-14" : (position === 'right' ? "left-20 text-left" : "right-20 text-right"),
                status === 'locked' ? "opacity-60" : "opacity-100"
            )}>
                <span className={clsx(
                    "block font-black text-sm uppercase",
                    status === 'current' ? "text-gray-900" : "text-gray-500"
                )}>
                    {level.label}
                </span>

                {status === 'current' && (
                    <motion.span
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        className="block text-[#F97316] text-[10px] font-black tracking-wide uppercase mt-0.5"
                    >
                        Current
                    </motion.span>
                )}

                {status === 'locked' && (
                    <span className="block text-gray-400 text-[10px] font-bold mt-0.5">
                        Locked
                    </span>
                )}

                {status === 'completed' && (
                    <span className="block text-gray-400 text-[10px] font-bold mt-0.5">
                        Completed
                    </span>
                )}
            </div>
        </div>
    );
}
