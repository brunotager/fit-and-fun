import { z } from 'zod';

// UUID v4 pattern
const uuidSchema = z.string().uuid();

// --- Sync User Schema (S4) ---
export const syncUserSchema = z.object({
  id: uuidSchema,
  name: z.string().max(100).default(''),
  joinDate: z.string().max(50).default(''),
  goalType: z.enum(['cardio', 'strength', 'mobility']).optional(),
  lastActiveDay: z.number().int().min(1).max(100).optional(),
  heightPrimary: z.coerce.number().min(0).max(300).optional().nullable(),
  heightSecondary: z.coerce.number().min(0).max(300).optional().nullable(),
  heightUnit: z.enum(['ft/in', 'm/cm']).optional().nullable(),
  weight: z.coerce.number().min(0).max(1000).optional().nullable(),
  weightUnit: z.enum(['lbs', 'kg']).optional().nullable(),
  notificationsEnabled: z.boolean().optional(),
  waitlistEmail: z.string().max(255).optional().nullable(),
  connectedDevice: z.string().max(50).optional().nullable(),
});

// --- Sync Workout Schema (S4) ---
export const syncWorkoutSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema,
  date: z.string().max(50),
  type: z.enum(['cardio', 'strength', 'mobility']),
  duration: z.number().int().min(1).max(60),
  points: z.number().int().min(0).max(1000),
  completionType: z.enum(['timer_finished', 'manual_end']).optional(),
  workoutId: z.string().max(50),
});

// --- Deactivate User Schema (D1) ---
export const deactivateUserSchema = z.object({
  id: uuidSchema,
});

// --- Waitlist Schema (U2) ---
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const waitlistSchema = z.object({
  email: z.string().regex(emailRegex, 'Invalid email address').max(255),
  userId: uuidSchema.optional(),
  name: z.string().max(100).optional(),
});
