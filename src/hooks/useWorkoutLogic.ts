import { useState, useEffect, useRef } from 'react';

// Assuming steps are evenly distributed for this prototype
// In a real app, steps would have specific durations
export function useWorkoutLogic(totalDurationMinutes: number, totalSteps: number, onComplete: () => void) {
    const totalSeconds = totalDurationMinutes * 60;
    const stepDurationSeconds = totalSteps > 0 ? totalSeconds / totalSteps : totalSeconds;

    const [timeLeft, setTimeLeft] = useState(totalSeconds);
    const [isActive, setIsActive] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    const savedOnComplete = useRef(onComplete);
    useEffect(() => {
        savedOnComplete.current = onComplete;
    }, [onComplete]);

    // We calculate current step based on elapsed time to ensure sync
    const elapsed = totalSeconds - timeLeft;
    const currentStepIndex = Math.min(
        Math.floor(elapsed / stepDurationSeconds),
        totalSteps > 0 ? totalSteps - 1 : 0
    );

    // Step Time Calculation
    // Time remaining in current step = Step Duration - (Elapsed % Step Duration)
    // Using modulo might result in 0 at the exact start of a step, handling edge cases
    const timeInCurrentStep = elapsed % stepDurationSeconds;
    const stepTimeLeft = Math.max(0, stepDurationSeconds - timeInCurrentStep);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    return prev > 0 ? prev - 1 : 0;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft > 0]);

    useEffect(() => {
        if (timeLeft === 0 && !isCompleted) {
            setIsActive(false);
            setIsCompleted(true);
            savedOnComplete.current();
        }
    }, [timeLeft, isCompleted]);

    const togglePause = () => setIsActive(!isActive);

    return {
        timeLeft,
        stepTimeLeft,
        currentStepIndex,
        isActive,
        isCompleted,
        togglePause,
        formatTime: (sec: number) => {
            const m = Math.floor(sec / 60);
            const s = Math.floor(sec % 60); // Ensure integer
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        },
        progressPercentage: (timeLeft / totalSeconds) * 100,
        stepProgressPercentage: totalSteps > 0 ? (stepTimeLeft / stepDurationSeconds) * 100 : 100
    };
}
