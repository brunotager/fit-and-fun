import { workouts, type Workout } from '@/data/workouts';

/**
 * Returns the curated 7-day Level 1 plan.
 * Exercises and GIFs are defined in workouts.ts — no external API calls.
 */
export const generate7DayPlan = (_fitnessGoal?: string, _activityLevel?: string): Workout[] => {
    return workouts;
};
