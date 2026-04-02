'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CircularTimerProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
    children?: React.ReactNode;
    className?: string;
}

export function CircularTimer({
    progress,
    size = 120,
    strokeWidth = 8,
    color = "#f97316", // brand-500
    trackColor = "#e5e7eb", // gray-200
    children,
    className = ""
}: CircularTimerProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    // Ensure progress is clamped 0-100
    const clampedProgress = Math.min(100, Math.max(0, progress));
    const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                {/* Track Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                />

                {/* Progress Circle - Animated */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </svg>

            {/* Content (Time/Label) */}
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    );
}
