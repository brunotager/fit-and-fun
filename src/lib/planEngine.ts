import { FitnessGoal, ActivityLevel, GoalType } from '@/context/FitFunContext';
import { workouts } from '@/data/workouts';

const getWorkout = (type: string, duration: number) => {
    return workouts.find(w => w.id === `${type}_${duration}`);
};

export const generate7DayPlan = (fitnessGoal?: FitnessGoal, activityLevel?: ActivityLevel) => {
    // Generate an array of exactly 7 workouts from the library.
    
    // Scale down duration if ActivityLevel is Sedentary to reduce friction
    const isSedentary = activityLevel === 'Sedentary';
    
    const assign = (type: GoalType, highDur: number, lowDur: number) => {
        const dur = isSedentary ? lowDur : highDur;
        return getWorkout(type, dur) || workouts[0];
    };

    let plan = [];

    if (fitnessGoal === 'Weight loss') {
        plan = [
            assign('cardio', 10, 5),
            assign('strength', 5, 5),
            assign('cardio', 5, 5),
            assign('mobility', 5, 5),
            assign('cardio', 10, 5),
            assign('strength', 10, 5),
            assign('mobility', 10, 5),
        ];
    } else if (fitnessGoal === 'Muscle gain') {
        plan = [
            assign('strength', 10, 5),
            assign('strength', 10, 5),
            assign('mobility', 5, 5),
            assign('cardio', 5, 5),
            assign('strength', 10, 5),
            assign('strength', 10, 5),
            assign('mobility', 10, 5),
        ];
    } else {
        // Balanced / Maintain weight
        plan = [
            assign('cardio', 5, 5),
            assign('strength', 5, 5),
            assign('mobility', 5, 5),
            assign('cardio', 10, 5),
            assign('strength', 10, 5),
            assign('mobility', 10, 5),
            assign('cardio', 10, 5),
        ];
    }

    return plan;
};
