export function getToday() {
    return new Date().toISOString().split("T")[0];
}

export function updateProgress(progress: any, workout: any) {
    const today = getToday();

    let newStreak = 1;

    if (progress.lastWorkoutDate) {
        const last = new Date(progress.lastWorkoutDate);
        // Explicitly set time to midnight to avoid timezone issues affecting date diffs if not strictly ISO date strings
        // but here we are parsing YYYY-MM-DD so let's be careful.
        // simpler:
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDate = yesterday.toISOString().split("T")[0];

        // logic from user request
        const lastDate = progress.lastWorkoutDate; // Assuming stored as "YYYY-MM-DD"

        if (lastDate === today) {
            newStreak = progress.currentStreak;
        } else if (lastDate === yesterdayDate) {
            newStreak = progress.currentStreak + 1;
        }
    }

    const updatedProgress = {
        ...progress,
        totalPoints: progress.totalPoints + workout.points,
        workoutsCompleted: progress.workoutsCompleted + 1,
        currentStreak: newStreak,
        lastWorkoutDate: today
    };

    return updatedProgress;
}

export function checkBadges(progress: any, workoutsLog: any[]) {
    const badges = new Set(progress.badges);

    if (progress.workoutsCompleted >= 1) badges.add("first_workout");
    if (progress.workoutsCompleted >= 3) badges.add("three_workouts");
    if (progress.currentStreak >= 3) badges.add("streak_3");
    if (progress.currentStreak >= 7) badges.add("streak_7");
    if (progress.totalPoints >= 100) badges.add("points_100");

    const categories = new Set(
        workoutsLog.map(w => w.type ? w.type.toLowerCase() : "")
    );
    if (
        categories.has("cardio") &&
        categories.has("strength") &&
        categories.has("mobility")
    ) {
        badges.add("balanced_week");
    }

    return Array.from(badges);
}
