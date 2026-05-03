'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { updateProgress, checkBadges } from '@/lib/progressEngine';
import { workouts } from '@/data/workouts';
import { ToastContainer, ToastMessage } from '@/components/Toast';

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
  completionType?: 'timer_finished' | 'manual_end';
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
  logOut: () => void; // U3: non-destructive log out
  updateProgressState: (data: Partial<Progress>) => void;
  isLoading: boolean;
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
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

// --- Retry Queue (E1) ---

interface PendingSync {
  id: string;
  url: string;
  body: object;
  timestamp: number;
}

function loadPendingSyncs(): PendingSync[] {
  try {
    const raw = localStorage.getItem('fitfun_pending_syncs');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingSyncs(syncs: PendingSync[]) {
  localStorage.setItem('fitfun_pending_syncs', JSON.stringify(syncs));
}

function addPendingSync(url: string, body: object) {
  const syncs = loadPendingSyncs();
  syncs.push({ id: crypto.randomUUID(), url, body, timestamp: Date.now() });
  savePendingSyncs(syncs);
}

function removePendingSync(id: string) {
  const syncs = loadPendingSyncs().filter(s => s.id !== id);
  savePendingSyncs(syncs);
}

// --- Context ---

const FitFunContext = createContext<FitFunContextType | undefined>(undefined);

export function FitFunProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string>('');
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [progress, setProgress] = useState<Progress>(INITIAL_PROGRESS);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Toast helpers
  const addToast = useCallback((text: string, type: 'error' | 'success' = 'error') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev.slice(-2), { id, text, type }]); // max 3 visible
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Resilient fetch helper (E1) — retries on failure, queues for later
  const resilientFetch = useCallback(async (url: string, body: object) => {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return true;
    } catch (err) {
      console.error(`Sync failed (${url}):`, err);
      addPendingSync(url, body);
      addToast('Sync failed — will retry automatically', 'error');
      return false;
    }
  }, [addToast]);

  // Retry pending syncs on mount (E1)
  useEffect(() => {
    if (isLoading) return;

    const pending = loadPendingSyncs();
    if (pending.length === 0) return;

    const retryAll = async () => {
      let succeeded = 0;
      for (const sync of pending) {
        try {
          const res = await fetch(sync.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sync.body),
          });
          if (res.ok) {
            removePendingSync(sync.id);
            succeeded++;
          }
        } catch {
          // Still failing — leave in queue
        }
      }
      if (succeeded > 0) {
        addToast(`Synced ${succeeded} pending update${succeeded > 1 ? 's' : ''}`, 'success');
      }
    };

    retryAll();
  }, [isLoading, addToast]);

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
      resilientFetch('/api/sync-user', {
        id: currentUserId,
        name: currentProfile.name,
        joinDate: currentProfile.joinDate,
        goalType: currentProfile.goalType,
        fitnessGoal: currentProfile.fitnessGoal,
        activityLevel: currentProfile.activityLevel,
        lastActiveDay: currentProgress.currentPlanDay,
      });
    }, 1500);
  }, [resilientFetch]);

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
    const completionType = data.completionType || 'manual_end';

    // U1: 0 points and 0 calories for manual_end — user must finish the workout to earn rewards
    const earnedPoints = completionType === 'timer_finished' ? data.points : 0;
    const earnedCalories = completionType === 'timer_finished' ? data.calories : 0;

    const newLog: WorkoutLog = {
      id: crypto.randomUUID(),
      date: now,
      type: data.type,
      duration: data.duration,
      points: earnedPoints,
      calories: earnedCalories,
      workoutId: data.workoutId,
      completionType: completionType,
    };
    const newLogs = [newLog, ...logs];
    setLogs(newLogs);

    // Sync workout to DB (E1: now with retry)
    if (userId) {
      resilientFetch('/api/sync-workout', {
        id: newLog.id,
        userId: userId,
        date: newLog.date,
        type: newLog.type,
        duration: newLog.duration,
        points: earnedPoints,
        completionType: newLog.completionType,
        workoutId: newLog.workoutId,
      });
    }

    const engineUpdated = updateProgress(progress, { ...newLog, points: earnedPoints });

    // D3: Only advance plan day if timer finished AND we haven't already completed today
    const today = new Date().toISOString().split('T')[0];
    const alreadyCompletedToday = logs.some(
      log => log.date.split('T')[0] === today && log.completionType === 'timer_finished'
    );
    const newPlanDay = (completionType === 'timer_finished' && !alreadyCompletedToday)
      ? engineUpdated.currentPlanDay + 1
      : engineUpdated.currentPlanDay;

    const newBadges = checkBadges(engineUpdated, newLogs);

    setProgress({
      ...engineUpdated,
      currentPlanDay: newPlanDay,
      badges: newBadges,
      points: engineUpdated.totalPoints
    });
  };

  // D1: Deactivate user server-side before clearing local data
  const resetProgress = async () => {
    if (userId) {
      try {
        await fetch('/api/deactivate-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId }),
        });
      } catch (err) {
        console.error('Deactivate user error:', err);
      }
    }

    setProfile(INITIAL_PROFILE);
    setProgress(INITIAL_PROGRESS);
    setLogs([]);
    localStorage.removeItem('fitfun_profile');
    localStorage.removeItem('fitfun_progress');
    localStorage.removeItem('fitfun_workouts_log');
    localStorage.removeItem('fitfun_user_id');
    localStorage.removeItem('fitfun_pending_syncs');
    window.location.href = '/';
  };

  // U3: Non-destructive log out — preserves data, returns to home
  const logOut = () => {
    window.location.href = '/home';
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
      logOut,
      updateProgressState,
      isLoading,
      toasts,
      dismissToast,
    }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
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
