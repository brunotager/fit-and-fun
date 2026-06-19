export interface Workout {
    id: string;
    category: 'Cardio' | 'Strength' | 'Mobility';
    duration: number;
    points: number;
    steps: string[];
    gifUrls?: string[];  // parallel to steps — gifUrls[i] is the demo GIF for steps[i]
}

/**
 * Curated Level 1 Plan — 7 days, 5-minute workouts, 5 exercises each.
 * 
 * GIF files go in /public/exercises/ as:
 *   /exercises/march-in-place.gif
 *   /exercises/jumping-jacks.gif
 *   etc.
 * 
 * Rotation: Cardio → Strength → Mobility → Cardio → Strength → Mobility → Full Body
 */
export const workouts: Workout[] = [
    // ── Day 1: Cardio ──────────────────────────────────────────────
    {
        id: "level1_day1",
        category: "Cardio",
        duration: 5,
        points: 50,
        steps: [
            "March in Place – 1 min",
            "Jumping Jacks – 1 min",
            "High Knees – 1 min",
            "Butt Kicks – 1 min",
            "Cool Down Breathing – 20 sec"
        ],
        gifUrls: [
            "/exercises/march-in-place.gif",
            "/coach-gabi-jumping-jacks.mp4",
            "/coach-gabi-high-knees.mp4",
            "/exercises/butt-kicks.gif",
            "/coach-gabi-breathing.mp4"
        ]
    },

    // ── Day 2: Strength ────────────────────────────────────────────
    {
        id: "level1_day2",
        category: "Strength",
        duration: 5,
        points: 50,
        steps: [
            "Bodyweight Squats – 1 min",
            "Wall Push-ups – 1 min",
            "Glute Bridges – 1 min",
            "Plank Hold – 1 min",
            "Stretch – 20 sec"
        ],
        gifUrls: [
            "/coach-gabi-body-squats.mp4",
            "/coach-gabi-wall-pushups.mp4",
            "/exercises/glute-bridges.gif",
            "/exercises/plank-hold.gif",
            "/coach-gabi-breathing.mp4"
        ]
    },

    // ── Day 3: Mobility ────────────────────────────────────────────
    {
        id: "level1_day3",
        category: "Mobility",
        duration: 5,
        points: 50,
        steps: [
            "Neck Rolls – 1 min",
            "Shoulder Circles – 1 min",
            "Hip Circles – 1 min",
            "Hamstring Stretch – 1 min",
            "Deep Breathing – 20 sec"
        ],
        gifUrls: [
            "/exercises/neck-rolls.gif",
            "/exercises/shoulder-circles.gif",
            "/exercises/hip-circles.gif",
            "/exercises/hamstring-stretch.gif",
            "/coach-gabi-breathing.mp4"
        ]
    },

    // ── Day 4: Cardio ──────────────────────────────────────────────
    {
        id: "level1_day4",
        category: "Cardio",
        duration: 5,
        points: 50,
        steps: [
            "Step Jacks – 1 min",
            "Skater Hops – 1 min",
            "High Knees – 1 min",
            "Jumping Jacks – 1 min",
            "Cool Down Breathing – 20 sec"
        ],
        gifUrls: [
            "/exercises/step-jacks.gif",
            "/exercises/skater-hops.gif",
            "/coach-gabi-high-knees.mp4",
            "/coach-gabi-jumping-jacks.mp4",
            "/coach-gabi-breathing.mp4"
        ]
    },

    // ── Day 5: Strength ────────────────────────────────────────────
    {
        id: "level1_day5",
        category: "Strength",
        duration: 5,
        points: 50,
        steps: [
            "Standing Lunges – 1 min",
            "Calf Raises – 1 min",
            "Bird Dog – 1 min",
            "Side Plank Hold – 1 min",
            "Stretch – 20 sec"
        ],
        gifUrls: [
            "/exercises/standing-lunges.gif",
            "/exercises/calf-raises.gif",
            "/exercises/bird-dog.gif",
            "/exercises/side-plank-hold.gif",
            "/coach-gabi-breathing.mp4"
        ]
    },

    // ── Day 6: Mobility ────────────────────────────────────────────
    {
        id: "level1_day6",
        category: "Mobility",
        duration: 5,
        points: 50,
        steps: [
            "Cat-Cow Stretch – 1 min",
            "Torso Twists – 1 min",
            "Quad Stretch – 1 min",
            "Child's Pose – 1 min",
            "Deep Breathing – 20 sec"
        ],
        gifUrls: [
            "/exercises/cat-cow-stretch.gif",
            "/exercises/torso-twists.gif",
            "/exercises/quad-stretch.gif",
            "/exercises/childs-pose.gif",
            "/coach-gabi-breathing.mp4"
        ]
    },

    // ── Day 7: Full Body ───────────────────────────────────────────
    {
        id: "level1_day7",
        category: "Strength",
        duration: 5,
        points: 50,
        steps: [
            "Bodyweight Squats – 1 min",
            "Jumping Jacks – 1 min",
            "Wall Push-ups – 1 min",
            "Plank Hold – 1 min",
            "Cool Down Breathing – 20 sec"
        ],
        gifUrls: [
            "/coach-gabi-body-squats.mp4",
            "/coach-gabi-jumping-jacks.mp4",
            "/coach-gabi-wall-pushups.mp4",
            "/exercises/plank-hold.gif",
            "/coach-gabi-breathing.mp4"
        ]
    }
];
