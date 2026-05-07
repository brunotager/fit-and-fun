import { useState, useEffect, useRef } from 'react';

export interface StepInfo {
  index: number;         // Index into the original exercise steps array
  isRest: boolean;       // Whether this is a rest period
  label: string;         // Display label (exercise name or "REST")
}

// Builds an interleaved schedule: [exercise, rest, exercise, rest, ..., exercise]
function buildSchedule(totalSteps: number, restSeconds: number, totalSeconds: number): { steps: StepInfo[]; durations: number[] } {
  if (totalSteps <= 0) return { steps: [], durations: [] };

  const restCount = totalSteps - 1; // rest between each pair
  const totalRestTime = restCount * restSeconds;
  const exerciseTime = totalSeconds - totalRestTime;
  const perExercise = exerciseTime / totalSteps;

  const steps: StepInfo[] = [];
  const durations: number[] = [];

  for (let i = 0; i < totalSteps; i++) {
    steps.push({ index: i, isRest: false, label: '' }); // label filled by UI
    durations.push(perExercise);

    if (i < totalSteps - 1) {
      steps.push({ index: i, isRest: true, label: 'REST' });
      durations.push(restSeconds);
    }
  }

  return { steps, durations };
}

export function useWorkoutLogic(totalDurationMinutes: number, totalSteps: number, onComplete: () => void, restSeconds = 15) {
  const totalSeconds = totalDurationMinutes * 60;
  const { steps: schedule, durations } = buildSchedule(totalSteps, restSeconds, totalSeconds);

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  const savedOnComplete = useRef(onComplete);
  useEffect(() => {
    savedOnComplete.current = onComplete;
  }, [onComplete]);

  // Determine which schedule slot we're in based on elapsed time
  const elapsed = totalSeconds - timeLeft;
  let cumulative = 0;
  let currentSlotIndex = 0;
  for (let i = 0; i < durations.length; i++) {
    cumulative += durations[i];
    if (elapsed < cumulative) {
      currentSlotIndex = i;
      break;
    }
    if (i === durations.length - 1) {
      currentSlotIndex = i;
    }
  }

  const currentSlot = schedule[currentSlotIndex] || { index: 0, isRest: false, label: '' };
  const slotStart = durations.slice(0, currentSlotIndex).reduce((a, b) => a + b, 0);
  const slotDuration = durations[currentSlotIndex] || 1;
  const slotElapsed = elapsed - slotStart;
  const slotTimeLeft = Math.max(0, slotDuration - slotElapsed);

  // Map back to the original exercise index (skipping rest slots)
  const currentStepIndex = currentSlot.index;
  const isResting = currentSlot.isRest;

  // Next exercise name hint (for rest screen)
  const nextExerciseIndex = isResting ? currentSlot.index + 1 : currentSlot.index + 1;

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
    stepTimeLeft: slotTimeLeft,
    currentStepIndex,
    isResting,
    nextExerciseIndex,
    isActive,
    isCompleted,
    togglePause,
    formatTime: (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    progressPercentage: (timeLeft / totalSeconds) * 100,
    stepProgressPercentage: totalSteps > 0 ? (slotTimeLeft / slotDuration) * 100 : 100
  };
}
