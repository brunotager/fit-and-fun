'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { updateProgress, checkBadges } from '@/lib/progressEngine';
import { workouts } from '@/data/workouts';

// --- Types ---

export type GoalType = 'cardio' | 'strength' | 'mobility';

export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active' | '';
export type FitnessGoal = 'Weight loss' | 'Muscle gain' | 'Maintain weight' | '';

export interface Profile {
  name: string;
  motivation: string;
  goalType: GoalType;
  setupComplete: boolean;
  joinDate: string;
  
  // New Physical/Personal Fields
  profileImage?: string; // base64
  heightPrimary?: number; // ft or m
  heightSecondary?: number; // in or cm
  heightUnit?: 'ft/in' | 'm/cm';
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;
}

export interface WorkoutLog {
  id: string;
  date: string; // ISO string
  type: GoalType;
  duration: number; // minutes
  points: number;
  calories: number;
  workoutId: string; // e.g. "cardio_5"
  completionType?: 'timer_finished' | 'manual_end'; // NEW
}

export interface Progress {
  totalPoints: number; // Renamed from points
  points: number; // Kept for backward compatibility if needed, but we should migrate
  workoutsCompleted: number; // New field
  currentPlanDay: number;
  currentStreak: number;
  lastWorkoutDate: string | null; // "YYYY-MM-DD"
  badges: string[];
}

interface FitFunContextType {
  userId: string;
  profile: Profile;
  progress: Progress;
  logs: WorkoutLog[];
  updateProfile: (data: Partial<Profile>) => void;
  completeWorkout: (data: { type: GoalType; duration: number; points: number; calories: number; workoutId: string; completionType?: 'timer_finished' | 'manual_end' }) => void;
  resetProgress: () => void;
  updateProgressState: (data: Partial<Progress>) => void;
  isLoading: boolean;
}

// --- Constants ---

const INITIAL_PROFILE: Profile = {
  name: '',
  motivation: '',
  goalType: 'cardio',
  setupComplete: false,
  joinDate: '',
  heightUnit: 'ft/in',
  weightUnit: 'lbs',
};

const INITIAL_PROGRESS: Progress = {
  totalPoints: 0,
  points: 0,
  workoutsCompleted: 0,
  currentPlanDay: 1,
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
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    let savedUserId = localStorage.getItem('fitfun_user_id');
    if (!savedUserId) {
      savedUserId = crypto.randomUUID();
      localStorage.setItem('fitfun_user_id', savedUserId);
    }
    setUserId(savedUserId);

    const savedProfile = localStorage.getItem('fitfun_profile');
    const savedProgress = localStorage.getItem('fitfun_progress');
    const savedLogs = localStorage.getItem('fitfun_workouts_log');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedProgress) {
      const loaded = JSON.parse(savedProgress);
      setProgress({
        ...INITIAL_PROGRESS,
        ...loaded,
        currentPlanDay: loaded.currentPlanDay ?? 1,
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

  const syncProfileToDB = useCallback((currentProfile: Profile, currentProgress: Progress, currentUserId: string) => {
    if (!currentProfile.setupComplete || !currentUserId) return;
    
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    
    syncTimeoutRef.current = setTimeout(() => {
      fetch('/api/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentUserId,
          name: currentProfile.name,
          joinDate: currentProfile.joinDate,
          goalType: currentProfile.goalType,
          fitnessGoal: currentProfile.fitnessGoal,
          activityLevel: currentProfile.activityLevel,
          lastActiveDay: currentProgress.currentPlanDay,
        })
      }).catch(err => console.error("Sync user error:", err));
    }, 1500);
  }, []);

  // Watch for profile/progress changes to sync
  useEffect(() => {
    if (isLoading) return;
    syncProfileToDB(profile, progress, userId);
  }, [profile, progress.currentPlanDay, userId, isLoading, syncProfileToDB]);

  const updateProfile = (data: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...data }));
  };

  const updateProgressState = (data: Partial<Progress>) => {
    setProgress((prev) => ({ ...prev, ...data }));
  };

  const completeWorkout = (data: { type: GoalType; duration: number; points: number; calories: number; workoutId: string; completionType?: 'timer_finished' | 'manual_end' }) => {
    const now = new Date().toISOString();

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date: now,
      type: data.type,
      duration: data.duration,
      points: data.points,
      calories: data.calories,
      workoutId: data.workoutId,
      completionType: data.completionType || 'manual_end'
    };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);

    // Sync workout to DB
    if (userId) {
      fetch('/api/sync-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newLog.id,
          userId: userId,
          date: newLog.date,
          type: newLog.type,
          duration: newLog.duration,
          points: newLog.points,
          completionType: newLog.completionType,
          workoutId: newLog.workoutId
        })
      }).catch(err => console.error("Sync workout error:", err));
    }

    const engineUpdated = updateProgress(progress, newLog);
    const newPlanDay = engineUpdated.currentPlanDay + 1;
    const newBadges = checkBadges(engineUpdated, newLogs);

    setProgress({
      ...engineUpdated,
      currentPlanDay: newPlanDay,
      badges: newBadges,
      points: engineUpdated.totalPoints
    });
  };

  const resetProgress = () => {
    setProfile(INITIAL_PROFILE);
    setProgress(INITIAL_PROGRESS);
    setLogs([]);
    localStorage.removeItem('fitfun_profile');
    localStorage.removeItem('fitfun_progress');
    localStorage.removeItem('fitfun_workouts_log');
    window.location.href = '/';
  };

  return (
    <FitFunContext.Provider value={{
      userId,
      profile,
      progress,
      logs,
      updateProfile,
      completeWorkout,
      resetProgress,
      updateProgressState,
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
