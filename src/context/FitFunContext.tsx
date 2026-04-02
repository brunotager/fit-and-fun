'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { updateProgress, checkBadges } from '@/lib/progressEngine';
import { workouts } from '@/data/workouts';

// --- Types ---

export type GoalType = 'cardio' | 'strength' | 'mobility';

export interface Profile {
  name: string;
  motivation: string;
  goalType: GoalType;
  setupComplete: boolean;
  joinDate: string;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO string
  type: GoalType;
  duration: number; // minutes
  points: number;
  workoutId: string; // e.g. "cardio_5"
}

export interface Progress {
  totalPoints: number; // Renamed from points
  points: number; // Kept for backward compatibility if needed, but we should migrate
  workoutsCompleted: number; // New field
  currentStreak: number;
  lastWorkoutDate: string | null; // "YYYY-MM-DD"
  badges: string[];
}

interface FitFunContextType {
  profile: Profile;
  progress: Progress;
  logs: WorkoutLog[];
  updateProfile: (data: Partial<Profile>) => void;
  completeWorkout: (type: GoalType, duration: number) => void;
  resetProgress: () => void;
  isLoading: boolean;
}

// --- Constants ---

const INITIAL_PROFILE: Profile = {
  name: '',
  motivation: '',
  goalType: 'cardio',
  setupComplete: false,
  joinDate: '',
};

const INITIAL_PROGRESS: Progress = {
  totalPoints: 0,
  points: 0,
  workoutsCompleted: 0,
  currentStreak: 0,
  lastWorkoutDate: null,
  badges: [],
};

export const BADGES = [
  { id: 'first_workout', name: 'First Step', description: 'Completed your first workout!' },
  { id: 'three_workouts', name: 'Momentum', description: 'Completed 3 workouts.' },
  { id: 'streak_3', name: 'On Fire', description: '3-day streak!' },
  { id: 'streak_7', name: 'Unstoppable', description: '7-day streak!' },
  { id: 'points_100', name: 'Century Club', description: 'Earned 100 points.' },
  { id: 'balanced_week', name: 'Balanced', description: 'Tried cardio, strength, and mobility.' },
];

// --- Context ---

const FitFunContext = createContext<FitFunContextType | undefined>(undefined);

export function FitFunProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('fitfun_profile');
    const savedProgress = localStorage.getItem('fitfun_progress');
    const savedLogs = localStorage.getItem('fitfun_workouts_log');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedProgress) {
      // Migration support: if totalPoints/workoutsCompleted missing
      const loaded = JSON.parse(savedProgress);
      setProgress({
        ...INITIAL_PROGRESS,
        ...loaded,
        totalPoints: loaded.totalPoints ?? loaded.points ?? 0,
        workoutsCompleted: loaded.workoutsCompleted ?? 0
      });
    }
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    setIsLoading(false);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoading) return;
    localStorage.setItem('fitfun_profile', JSON.stringify(profile));
    localStorage.setItem('fitfun_progress', JSON.stringify(progress));
    localStorage.setItem('fitfun_workouts_log', JSON.stringify(logs));
  }, [profile, progress, logs, isLoading]);

  const updateProfile = (data: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const completeWorkout = (type: GoalType, duration: number) => {
    // Reconstruct ID to match workout data (e.g. "cardio_5")
    const workoutId = `${type.toLowerCase()}_${duration}`;

    // Find workout data or fallback
    const workoutData = workouts.find(w => w.id === workoutId) || {
      id: workoutId,
      points: (duration === 5 ? 15 : duration === 10 ? 30 : 60)
    };

    const now = new Date().toISOString();

    // 1. Update Logs
    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date: now,
      type,
      duration,
      points: workoutData.points,
      workoutId: workoutId
    };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);

    // 2. Use Engine to Update Progress
    const engineUpdated = updateProgress(progress, newLog);

    // 3. Use Engine to Check Badges
    const newBadges = checkBadges(engineUpdated, newLogs);

    setProgress({
      ...engineUpdated,
      badges: newBadges,
      points: engineUpdated.totalPoints // Sync legacy field
    });
  };

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all progress?")) {
      setProfile(INITIAL_PROFILE);
      setProgress(INITIAL_PROGRESS);
      setLogs([]);
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <FitFunContext.Provider value={{
      profile,
      progress,
      logs,
      updateProfile,
      completeWorkout,
      resetProgress,
      isLoading
    }}>
      {children}
    </FitFunContext.Provider>
  );
}

export function useFitFun() {
  const context = useContext(FitFunContext);
  if (context === undefined) {
    throw new Error('useFitFun must be used within a FitFunProvider');
  }
  return context;
}
